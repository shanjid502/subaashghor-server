import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CouponService } from './coupon.service';

const validateCoupon = catchAsync(async (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  const data = await CouponService.validateCoupon(code, Number(subtotal));
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Coupon is valid.',
    data,
  });
});

const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const data = await CouponService.createCoupon(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Coupon created.',
    data,
  });
});

const getAllCoupons = catchAsync(async (_req: Request, res: Response) => {
  const data = await CouponService.getAllCoupons();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Coupons fetched.',
    data,
  });
});

export const CouponControllers = {
  validateCoupon,
  createCoupon,
  getAllCoupons,
};
