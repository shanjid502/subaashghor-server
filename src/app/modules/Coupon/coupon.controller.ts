import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CouponService } from './coupon.service';

const validateCoupon = catchAsync(async (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  const result = await CouponService.validateCoupon(code, subtotal);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Coupon is valid',
    data: result,
  });
});

export const CouponController = {
  validateCoupon,
};
