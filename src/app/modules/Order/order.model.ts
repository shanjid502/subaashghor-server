import { Schema, model } from 'mongoose';
import { IOrder, IOrderItem, IShippingAddress } from './order.interface';

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    slug: String,
    name: String,
    image: String,
    ml: Number,
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const shippingSchema = new Schema<IShippingAddress>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    address: { type: String, required: true },
    area: String,
    city: String,
    district: { type: String, required: true },
    postcode: String,
    notes: String,
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: String,
    items: { type: [orderItemSchema], required: true },
    shipping: { type: shippingSchema, required: true },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: String,
    paymentMethod: { type: String, enum: ['cod', 'bkash'], required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'packed',
        'shipped',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
    },
    trackingId: String,
  },
  { timestamps: true },
);

export const OrderModel = model<IOrder>('Order', orderSchema);
