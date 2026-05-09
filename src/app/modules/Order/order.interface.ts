import { Document } from 'mongoose';

export interface IOrderItem {
  productId: string;
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

export interface IOrder extends Document {
  orderNumber: string;
  userId?: string;
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
  createdAt: Date;
  updatedAt: Date;
}
