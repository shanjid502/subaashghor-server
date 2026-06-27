import { Schema, model } from 'mongoose';

export interface ICoupon {
  _id?: string;
  code: string;
  type: 'flat' | 'percent';
  value: number;
  minSubtotal?: number;
  maxDiscount?: number;
  expiresAt?: Date;
  active: boolean;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true, // Auto uppercase for case-insensitive match
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['flat', 'percent'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minSubtotal: {
      type: Number,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      min: 0,
    },
    expiresAt: Date,
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret: any) => {
        ret._id = String(ret._id);
        if (ret.expiresAt) ret.expiresAt = ret.expiresAt.toISOString();
        delete ret.id;
        return ret;
      },
    },
  },
);

export const CouponModel = model<ICoupon>('Coupon', couponSchema);
