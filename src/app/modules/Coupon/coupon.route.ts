import express from 'express';
import { CouponController } from './coupon.controller';
import validateRequest from '../../utils/validateRequest';
import { CouponValidation } from './coupon.validation';

const router = express.Router();

router.post(
  '/validate',
  validateRequest(CouponValidation.validateCouponSchema),
  CouponController.validateCoupon,
);

export const CouponRoutes = router;
