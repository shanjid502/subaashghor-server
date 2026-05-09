import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { OrderModel } from './order.model';
import { IOrderItem, IShippingAddress } from './order.interface';
import { ProductModel } from '../Product/product.model';
import { CouponService } from '../Coupon/coupon.service';
import { CouponModel } from '../Coupon/coupon.model';
import { sendEmail, orderConfirmationEmail } from '../../utils/email.utils';
import config from '../../config';

interface PlaceOrderInput {
  items: Array<{
    productId: string;
    slug?: string;
    name?: string;
    image?: string;
    ml: number;
    price?: number;
    qty: number;
  }>;
  shipping: IShippingAddress;
  paymentMethod: 'cod' | 'bkash';
  couponCode?: string;
  userId?: string;
}

const generateOrderNumber = async (): Promise<string> => {
  const max = 999999;
  const min = 100000;
  let orderNumber: string;
  let exists = true;
  do {
    const digits = Math.floor(Math.random() * (max - min + 1)) + min;
    orderNumber = `SG-${digits}`;
    exists = !!(await OrderModel.findOne({ orderNumber }));
  } while (exists);
  return orderNumber;
};

const placeOrder = async (input: PlaceOrderInput) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Re-fetch every product and validate stock
    let subtotal = 0;
    const resolvedItems: IOrderItem[] = [];

    for (const item of input.items) {
      const product = await ProductModel.findById(item.productId).session(session);
      if (!product) {
        throw new AppError(StatusCodes.UNPROCESSABLE_ENTITY, `Product not found: ${item.productId}`);
      }

      const sizeEntry = product.sizes.find((s) => s.ml === item.ml);
      if (!sizeEntry) {
        throw new AppError(
          StatusCodes.UNPROCESSABLE_ENTITY,
          `Size ${item.ml}ml not available for ${product.name.en}`,
        );
      }
      if (sizeEntry.stock < item.qty) {
        throw new AppError(
          StatusCodes.UNPROCESSABLE_ENTITY,
          `${product.name.en} (${item.ml}ml) is out of stock.`,
        );
      }

      const unitPrice = sizeEntry.salePrice ?? sizeEntry.price;
      subtotal += unitPrice * item.qty;

      // Atomically decrement stock
      await ProductModel.findOneAndUpdate(
        {
          _id: item.productId,
          'sizes.ml': item.ml,
          'sizes.stock': { $gte: item.qty },
        },
        { $inc: { 'sizes.$.stock': -item.qty } },
        { session },
      );

      resolvedItems.push({
        productId: item.productId,
        slug: product.slug,
        name: product.name.en,
        image: product.images[0] ?? '',
        ml: item.ml,
        price: unitPrice,
        qty: item.qty,
      } as IOrderItem);
    }

    // 2. Shipping fee
    const shippingFee = subtotal >= config.free_shipping_threshold ? 0 : config.shipping_fee;

    // 3. Re-validate coupon and compute discount
    let discount = 0;
    let couponCode: string | undefined;
    if (input.couponCode) {
      try {
        const coupon = await CouponService.validateCoupon(input.couponCode, subtotal);
        couponCode = coupon.code;
        if (coupon.type === 'flat') {
          discount = coupon.value;
        } else {
          discount = Math.round((subtotal * coupon.value) / 100);
          if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
        }
        // Increment usage count
        await CouponModel.findOneAndUpdate(
          { code: coupon.code },
          { $inc: { usedCount: 1 } },
          { session },
        );
      } catch {
        // Coupon validation failed — proceed without discount
        discount = 0;
      }
    }

    const total = subtotal + shippingFee - discount;
    const orderNumber = await generateOrderNumber();

    const [order] = await OrderModel.create(
      [
        {
          orderNumber,
          userId: input.userId,
          items: resolvedItems,
          shipping: input.shipping,
          subtotal,
          shippingFee,
          discount,
          total,
          couponCode,
          paymentMethod: input.paymentMethod,
          paymentStatus: 'pending',
          status: 'confirmed',
        },
      ],
      { session },
    );

    await session.commitTransaction();

    // 4. Side effects (non-blocking)
    sendEmail({
      to: input.shipping.email ?? '',
      ...orderConfirmationEmail({
        orderNumber: order.orderNumber,
        customerName: input.shipping.name,
        total: order.total,
        items: resolvedItems.map((i) => ({
          name: i.name,
          ml: i.ml,
          qty: i.qty,
          price: i.price,
        })),
      }),
    }).catch(() => {}); // fire and forget

    return order;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
};

const getOrderByIdOrNumber = async (idOrNumber: string, userId?: string) => {
  const filter: Record<string, unknown> = {
    $or: [{ orderNumber: idOrNumber }, ...(mongoose.isValidObjectId(idOrNumber) ? [{ _id: idOrNumber }] : [])],
  };
  if (userId) filter.userId = userId;

  const order = await OrderModel.findOne(filter).lean();
  if (!order) throw new AppError(StatusCodes.NOT_FOUND, 'Order not found.');
  return order;
};

const getMyOrders = async (userId: string) => {
  return OrderModel.find({ userId }).sort({ createdAt: -1 }).lean();
};

const updateOrderStatus = async (
  orderNumber: string,
  update: { status?: string; paymentStatus?: string; trackingId?: string },
) => {
  const order = await OrderModel.findOneAndUpdate({ orderNumber }, update, { new: true });
  if (!order) throw new AppError(StatusCodes.NOT_FOUND, 'Order not found.');
  return order;
};

export const OrderService = {
  placeOrder,
  getOrderByIdOrNumber,
  getMyOrders,
  updateOrderStatus,
};
