import { Schema, model } from 'mongoose';
import { ICoupon } from './coupon.interface';

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    type: { type: String, enum: ['percent', 'flat'], required: true },
    value: { type: Number, required: true },
    minSubtotal: Number,
    maxDiscount: Number,
    expiresAt: Date,
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const CouponModel = model<ICoupon>('Coupon', couponSchema);
