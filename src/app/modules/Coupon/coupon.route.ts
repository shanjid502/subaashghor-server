import express from 'express';
import { CouponController } from './coupon.controller';
import validateRequest from '../../utils/validateRequest';
import { CouponValidation } from './coupon.validation';
import auth from '../../middlewares/auth.middleware';

const router = express.Router();

router.post(
  '/validate',
  validateRequest(CouponValidation.validateCouponSchema),
  CouponController.validateCoupon,
);

// Admin / Upload endpoints
router.get('/', auth('admin'), CouponController.getAllCoupons);
router.post('/', auth('admin'), CouponController.createCoupon);
router.patch('/:id', auth('admin'), CouponController.updateCoupon);
router.delete('/:id', auth('admin'), CouponController.deleteCoupon);

export const CouponRoutes = router;
