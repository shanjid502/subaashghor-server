import { Document } from 'mongoose';

export interface INotifyMe extends Document {
  productId: string;
  sizeMl: number;
  email: string;
  fulfilledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
