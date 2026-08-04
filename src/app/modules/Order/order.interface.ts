import { Types } from 'mongoose';

export interface IOrderItemInput {
  productId: string;
  slug?: string;
  name?: string;
  image?: string;
  ml: number;
  price?: number;
  qty: number;
}

export interface IShippingInput {
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

export interface ICreateOrderPayload {
  items: IOrderItemInput[];
  shipping: IShippingInput;
  paymentMethod: 'cod' | 'bkash';
  couponCode?: string;
  email?: string;
  _ipAddress?: string;
  _userAgent?: string;
  _fbclid?: string;
}

export interface IOrderPaginationQuery {
  page?: number;
  limit?: number;
}
