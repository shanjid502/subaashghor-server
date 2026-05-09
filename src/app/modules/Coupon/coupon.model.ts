import { Schema, model, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  type: 'flat' | 'percent';
  value: number;
  minSubtotal?: number;
  maxDiscount?: number;
  expiresAt?: Date;
  active: boolean;
  usageLimit?: number;
  usedCount: number;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['flat', 'percent'], required: true },
    value: { type: Number, required: true, min: 0 },
    minSubtotal: { type: Number, default: 0 },
    maxDiscount: Number,
    expiresAt: Date,
    active: { type: Boolean, default: true },
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const CouponModel = model<ICoupon>('Coupon', couponSchema);
