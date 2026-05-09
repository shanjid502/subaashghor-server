import { Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  type: 'percent' | 'flat';
  value: number;
  minSubtotal?: number;
  maxDiscount?: number;
  expiresAt?: Date;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
}
