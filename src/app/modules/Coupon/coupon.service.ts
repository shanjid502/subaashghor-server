import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { CouponModel } from './coupon.model';

const validateCoupon = async (code: string, subtotal: number) => {
  const coupon = await CouponModel.findOne({ code: code.toUpperCase() }).lean();

  if (!coupon || !coupon.active) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Invalid coupon.');
  }

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    throw new AppError(StatusCodes.UNPROCESSABLE_ENTITY, 'This coupon has expired.');
  }

  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    throw new AppError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      `Subtotal too low for this coupon. Minimum order: ৳${coupon.minSubtotal}.`,
    );
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError(StatusCodes.UNPROCESSABLE_ENTITY, 'This coupon has reached its usage limit.');
  }

  return {
    _id: (coupon._id as unknown as { toString(): string }).toString(),
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    minSubtotal: coupon.minSubtotal,
    maxDiscount: coupon.maxDiscount,
    expiresAt: coupon.expiresAt?.toISOString(),
    active: coupon.active,
  };
};

const createCoupon = async (payload: unknown) => CouponModel.create(payload as object);

const getAllCoupons = async () => CouponModel.find().lean();

export const CouponService = { validateCoupon, createCoupon, getAllCoupons };
