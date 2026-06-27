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

// Admin / Upload endpoints
router.get('/', CouponController.getAllCoupons);
router.post('/', CouponController.createCoupon);
router.patch('/:id', CouponController.updateCoupon);
router.delete('/:id', CouponController.deleteCoupon);

export const CouponRoutes = router;
