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

export const CouponService = {
  validateCoupon,
};
