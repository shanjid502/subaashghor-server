import { Document } from 'mongoose';

export interface IAddress extends Document {
  userId: string;
  label?: string;
  name: string;
  phone: string;
  address: string;
  area: string;
  city: string;
  district: string;
  postcode?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
