import { Schema, model, Types } from 'mongoose';

export interface IOrderItem {
  productId: Types.ObjectId;
  slug: string;
  name: string;
  image: string;
  ml: number;
  price: number;
  qty: number;
}

export interface IShippingAddress {
  name: string;
  phone: string;
  email?: string;
  address: string;
  area: string;
  city: string;
  district: string;
  postcode?: string;
  notes?: string;
}

export interface IOrder {
  _id?: string;
  orderNumber: string;
  userId?: Types.ObjectId;
  items: IOrderItem[];
  shipping: IShippingAddress;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  paymentMethod: 'cod' | 'bkash';
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  trackingId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  slug: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  ml: { type: Number, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, min: 1 },
});

const shippingAddressSchema = new Schema<IShippingAddress>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  address: { type: String, required: true },
  area: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  postcode: String,
  notes: String,
});

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    items: [orderItemSchema],
    shipping: shippingAddressSchema,
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    discount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    couponCode: String,
    paymentMethod: {
      type: String,
      enum: ['cod', 'bkash'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    trackingId: String,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret: any) => {
        ret._id = String(ret._id);
        if (ret.userId) ret.userId = String(ret.userId);
        delete ret.id;
        return ret;
      },
    },
  },
);

export const OrderModel = model<IOrder>('Order', orderSchema);
