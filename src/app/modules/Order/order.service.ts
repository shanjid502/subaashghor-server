import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { OrderModel } from './order.model';
import { ProductModel } from '../Product/product.model';
import { CouponModel } from '../Coupon/coupon.model';
import { dispatchWebhook } from '../../utils/webhookDispatcher';
import { sendMetaPurchaseEvent } from '../../utils/metaCapi';
import { generateEventId } from '../../utils/eventId';
import { sendTelegramOrderNotification } from '../../utils/telegramNotifier';

const createOrder = async (userId: string | undefined, payload: any) => {
  const { items, shipping, paymentMethod, couponCode } = payload;

  let subtotal = 0;
  const processedItems = [];
  const decrementedItems: { productId: string; ml: number; qty: number }[] = [];

  try {
    // 1. Verify products, recompute price, and update stock atomically
    for (const item of items) {
      const product = await ProductModel.findById(item.productId);
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
        { new: true },
      );

      if (!updatedProduct) {
        throw new AppError(
          StatusCodes.UNPROCESSABLE_ENTITY,
          `${product.name.en} (${item.ml}ml) is out of stock`,
        );
      }

      // Track successful decrement for possible rollback
      decrementedItems.push({
        productId: item.productId,
        ml: Number(item.ml),
        qty: item.qty,
      });

      // Use verified database price (supporting salePrice if present and greater than 0)
      const unitPrice = (sizeObj.salePrice !== undefined && sizeObj.salePrice > 0) ? sizeObj.salePrice : sizeObj.price;
      const itemSubtotal = unitPrice * item.qty;
      subtotal += itemSubtotal;

      processedItems.push({
        productId: product._id,
        slug: product.slug,
        name: product.name.en, // localise at order-time
        image: product.images[0],
        ml: Number(item.ml),
        price: unitPrice,
        qty: item.qty,
      });
    }
  } catch (error) {
    // Rollback any stock that was already decremented during this attempt
    for (const roll of decrementedItems) {
      await ProductModel.findOneAndUpdate(
        {
          _id: roll.productId,
          'sizes.ml': roll.ml,
        },
        {
          $inc: { 'sizes.$.stock': roll.qty },
        },
      );
    }
    throw error;
  }

  // 2. Shipping fee logic (free shipping for order >= 3000 BDT, else 130 BDT)
  const shippingFee = subtotal >= 3000 ? 0 : 130;

  // 3. Coupon validation & discount logic
  let discount = 0;
  if (couponCode) {
    const coupon = await CouponModel.findOne({
      code: couponCode.trim().toUpperCase(),
      active: true,
    });

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

  // Ensure total does not fall below zero
  const total = Math.max(0, subtotal + shippingFee - discount);

  // 4. Generate order number (e.g. SG-482910) with uniqueness guarantee
  let orderNumber = '';
  let isUnique = false;
  while (!isUnique) {
    const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
    orderNumber = `SG-${randomSixDigits}`;
    const existingOrder = await OrderModel.findOne({ orderNumber });
    if (!existingOrder) {
      isUnique = true;
    }
  }

  const orderData: any = {
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

  const order = await OrderModel.create(orderData);

  // --- Fire async side-effects (never block order response) ---
  setImmediate(async () => {
    const orderId = String(order._id);
    const eventId = generateEventId();

    // 5.5 Webhook: notify Zapier / Make.com
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

    // 5.3 Meta CAPI: server-side Purchase event
    await sendMetaPurchaseEvent({
      orderId,
      total: order.total,
      currency: 'BDT',
      email: (payload as any).email,
      phone: order.shipping?.phone,
      ipAddress: (payload as any)._ipAddress,
      userAgent: (payload as any)._userAgent,
      fbclid: (payload as any)._fbclid,
    });

    // Telegram Notification
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

  // Admins can see everything
  if (userPayload?.role === 'admin') {
    return order;
  }

  // If order is bound to a registered user
  if (order.userId) {
    if (!userPayload || String(order.userId) !== userPayload.userId) {
      throw new AppError(StatusCodes.FORBIDDEN, 'Unauthorized access to this order');
    }
    return order;
  }

  // If guest order, verify phone number matches shipping phone to prevent brute forcing
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

const getAllOrders = async () => {
  const orders = await OrderModel.find().sort({ createdAt: -1 });
  return orders;
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
