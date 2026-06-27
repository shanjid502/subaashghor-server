import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { CouponModel } from './coupon.model';

const validateCoupon = async (code: string, subtotal: number) => {
  const coupon = await CouponModel.findOne({
    code: code.trim().toUpperCase(),
    active: true,
  });

  if (!coupon) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Invalid coupon');
  }

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    throw new AppError(StatusCodes.UNPROCESSABLE_ENTITY, 'This coupon has expired');
  }

  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    throw new AppError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      'Subtotal too low for this coupon',
    );
  }

  return coupon;
};

const getAllCoupons = async () => {
  const coupons = await CouponModel.find().sort({ createdAt: -1 });
  return coupons;
};

const createCoupon = async (payload: any) => {
  const existing = await CouponModel.findOne({ code: payload.code.trim().toUpperCase() });
  if (existing) {
    throw new AppError(StatusCodes.CONFLICT, 'Coupon code already exists');
  }

  const result = await CouponModel.create(payload);
  return result;
};

const updateCoupon = async (id: string, payload: any) => {
  const result = await CouponModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Coupon not found');
  }

  return result;
};

const deleteCoupon = async (id: string) => {
  const result = await CouponModel.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Coupon not found');
  }
  return result;
};

export const CouponService = {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
