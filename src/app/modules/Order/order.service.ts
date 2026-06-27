import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { OrderModel } from './order.model';
import { ProductModel } from '../Product/product.model';
import { CouponModel } from '../Coupon/coupon.model';

const createOrder = async (userId: string | undefined, payload: any) => {
  const { items, shipping, paymentMethod, couponCode } = payload;

  let subtotal = 0;
  const processedItems = [];

  // 1. Verify products, recompute price, and update stock
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

    if (sizeObj.stock < item.qty) {
      throw new AppError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        `${product.name.en} (${item.ml}ml) is out of stock`,
      );
    }

    // Decrement stock
    sizeObj.stock -= item.qty;
    await product.save();

    // Use verified database price (supporting salePrice if present)
    const unitPrice = sizeObj.salePrice !== undefined ? sizeObj.salePrice : sizeObj.price;
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

  const total = subtotal + shippingFee - discount;

  // 4. Generate order number (e.g. SG-482910)
  const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
  const orderNumber = `SG-${randomSixDigits}`;

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
  return order;
};

const getMyOrders = async (userId: string) => {
  const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 });
  return orders;
};

const getOrderByIdOrNumber = async (userId: string | undefined, idOrNumber: string) => {
  const isObjectId = idOrNumber.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: idOrNumber } : { orderNumber: idOrNumber };

  const order = await OrderModel.findOne(query);
  if (!order) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Order not found');
  }

  // Ownership verification: if order has userId and requester is logged in, must match
  if (order.userId && userId && String(order.userId) !== userId) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Unauthorized access to this order');
  }

  return order;
};

export const OrderService = {
  createOrder,
  getMyOrders,
  getOrderByIdOrNumber,
};
