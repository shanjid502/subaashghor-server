import { Document } from 'mongoose';

export interface ISubscriber extends Document {
  email: string;
  subscribedAt: Date;
}

export interface ILead extends Document {
  name?: string;
  email: string;
  source: string;
  answers?: Record<string, string>;
  couponCode?: string;
  createdAt: Date;
  updatedAt: Date;
}
