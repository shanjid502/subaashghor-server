import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { OrderModel } from './order.model';
import { ProductModel } from '../Product/product.model';
import { CouponModel } from '../Coupon/coupon.model';
import { dispatchWebhook } from '../../utils/webhookDispatcher';
import { sendMetaPurchaseEvent } from '../../utils/metaCapi';
import { generateEventId } from '../../utils/eventId';
import { sendTelegramOrderNotification } from '../../utils/telegramNotifier';
import { ICreateOrderPayload } from './order.interface';
import { runInTransaction } from '../../utils/transaction';
import QueryBuilder from '../../utils/QueryBuilder';

const createOrder = async (userId: string | undefined, payload: ICreateOrderPayload) => {
  const { items, shipping, paymentMethod, couponCode } = payload;

  if (!items || !items.length) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Order items are required');
  }

  // Wrap stock decrement and order creation inside a managed transaction
  const order = await runInTransaction(async (session) => {
    let subtotal = 0;
    const processedItems = [];

    // 1. Verify products, recompute price, and update stock atomically
    for (const item of items) {
      const product = await ProductModel.findById(item.productId).session(session);
      if (!product) {
        throw new AppError(StatusCodes.NOT_FOUND, `Product not found: ${item.productId}`);
      }

      const sizeObj = product.sizes.find((s) => s.ml === Number(item.ml));
      if (!sizeObj) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          `Invalid size ${item.ml}ml for product ${product.name.en}`,
        );
      }

      // Decrement stock atomically
      const updatedProduct = await ProductModel.findOneAndUpdate(
        {
          _id: item.productId,
          'sizes.ml': Number(item.ml),
          'sizes.stock': { $gte: item.qty },
        },
        {
          $inc: { 'sizes.$.stock': -item.qty },
        },
        { new: true, session },
      );

      if (!updatedProduct) {
        throw new AppError(
          StatusCodes.UNPROCESSABLE_ENTITY,
          `${product.name.en} (${item.ml}ml) is out of stock`,
        );
      }

      // Use verified database price (supporting salePrice if present and greater than 0)
      const unitPrice =
        sizeObj.salePrice !== undefined && sizeObj.salePrice > 0 ? sizeObj.salePrice : sizeObj.price;
      const itemSubtotal = unitPrice * item.qty;
      subtotal += itemSubtotal;

      processedItems.push({
        productId: product._id,
        slug: product.slug,
        name: product.name.en,
        image: product.images[0],
        ml: Number(item.ml),
        price: unitPrice,
        qty: item.qty,
      });
    }

    // 2. Coupon validation & discount logic
    let discount = 0;
    if (couponCode) {
      const coupon = await CouponModel.findOne({
        code: couponCode.trim().toUpperCase(),
        active: true,
      }).session(session);

      if (coupon) {
        const isNotExpired = !coupon.expiresAt || new Date() <= coupon.expiresAt;
        const isSubtotalValid = !coupon.minSubtotal || subtotal >= coupon.minSubtotal;

        if (isNotExpired && isSubtotalValid) {
          if (coupon.type === 'flat') {
            discount = coupon.value;
          } else if (coupon.type === 'percent') {
            discount = Math.round((subtotal * coupon.value) / 100);
            if (coupon.maxDiscount) {
              discount = Math.min(discount, coupon.maxDiscount);
            }
          }
        }
      }
    }

    // 3. Shipping fee logic (Inside Dhaka: 70 BDT, Outside Dhaka: 130 BDT; Free shipping if subtotal - discount >= 3000 BDT)
    const isInsideDhaka =
      shipping.district?.trim().toLowerCase() === 'dhaka' ||
      shipping.area?.trim().toLowerCase().includes('inside dhaka');
    const shippingBase = isInsideDhaka ? 70 : 130;
    const netSubtotal = subtotal - discount;
    const shippingFee = netSubtotal >= 3000 ? 0 : shippingBase;

    // Ensure total does not fall below zero
    const total = Math.max(0, netSubtotal + shippingFee);

    // 4. Generate unique order number with retry guarantee against collisions
    let createdOrder = null;
    let attempts = 0;
    const maxAttempts = 5;

    while (!createdOrder && attempts < maxAttempts) {
      attempts++;
      const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
      const orderNumber = `SG-${randomSixDigits}`;

      const existingOrder = await OrderModel.findOne({ orderNumber }).session(session);
      if (existingOrder) continue;

      const orderData: Record<string, any> = {
        orderNumber,
        items: processedItems,
        shipping,
        subtotal,
        shippingFee,
        discount,
        total,
        paymentMethod,
        paymentStatus: 'pending',
        status: 'pending',
        couponCode,
      };

      if (userId) {
        orderData.userId = userId;
      }

      try {
        const result = await OrderModel.create([orderData], { session });
        createdOrder = result[0];
      } catch (err: any) {
        if (err.code === 11000 && attempts < maxAttempts) {
          continue; // Retry on duplicate orderNumber collision
        }
        throw err;
      }
    }

    if (!createdOrder) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to generate unique order number after multiple attempts',
      );
    }

    return createdOrder;
  });

  // --- Fire async side-effects (never block order response) ---
  setImmediate(async () => {
    const orderId = String(order._id);
    const eventId = generateEventId();

    await dispatchWebhook('order.created', {
      eventId,
      orderId,
      orderNumber: order.orderNumber,
      total: order.total,
      paymentMethod: order.paymentMethod,
      status: order.status,
      shipping: order.shipping,
      items: order.items,
    });

    await sendMetaPurchaseEvent({
      orderId,
      total: order.total,
      currency: 'BDT',
      email: payload.email,
      phone: order.shipping?.phone,
      ipAddress: payload._ipAddress,
      userAgent: payload._userAgent,
      fbclid: payload._fbclid,
    });

    await sendTelegramOrderNotification(order);
  });

  return order;
};

const getMyOrders = async (userId: string) => {
  const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 });
  return orders;
};

const getOrderByIdOrNumber = async (
  userPayload: { userId: string; role: string } | undefined,
  idOrNumber: string,
  phoneQuery?: string,
) => {
  const isObjectId = idOrNumber.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: idOrNumber } : { orderNumber: idOrNumber };

  const order = await OrderModel.findOne(query);
  if (!order) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Order not found');
  }

  if (userPayload?.role === 'admin') {
    return order;
  }

  if (order.userId) {
    if (!userPayload || String(order.userId) !== userPayload.userId) {
      throw new AppError(StatusCodes.FORBIDDEN, 'Unauthorized access to this order');
    }
    return order;
  }

  const cleanShippingPhone = order.shipping.phone.replace(/[^0-9]/g, '');
  const cleanQueryPhone = phoneQuery ? phoneQuery.replace(/[^0-9]/g, '') : '';

  if (!phoneQuery || cleanShippingPhone !== cleanQueryPhone) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Unauthorized access: Phone number verification required for guest orders',
    );
  }

  return order;
};

const getAllOrders = async (query: Record<string, unknown> = {}) => {
  const searchableFields = [
    'orderNumber',
    'shipping.name',
    'shipping.phone',
    'shipping.email',
    'shipping.city',
    'shipping.district',
    'paymentMethod',
    'status',
  ];

  const orderQuery = new QueryBuilder(OrderModel.find(), query)
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const orders = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();

  return {
    orders,
    meta,
  };
};

const updateOrderStatus = async (id: string, status: string) => {
  const order = await OrderModel.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true },
  );

  if (!order) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Order not found');
  }

  return order;
};

const deleteOrder = async (id: string) => {
  const order = await OrderModel.findById(id);
  if (!order) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Order not found');
  }

  if (order.status !== 'cancelled') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Only cancelled orders can be deleted to maintain database integrity',
    );
  }

  const result = await OrderModel.findByIdAndDelete(id);
  return result;
};

export const OrderService = {
  createOrder,
  getMyOrders,
  getOrderByIdOrNumber,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
};
