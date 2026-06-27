import express from 'express';
import { CouponController } from './coupon.controller';
import validateRequest from '../../utils/validateRequest';
import { CouponValidation } from './coupon.validation';
import auth from '../../middlewares/auth.middleware';
import { USER_ROLE } from '../Auth/auth.constant';

const router = express.Router();

router.post(
  '/validate',
  validateRequest(CouponValidation.validateCouponSchema),
  CouponController.validateCoupon,
);

// Admin / Upload endpoints
router.get('/', auth(USER_ROLE.admin), CouponController.getAllCoupons);
router.post('/', auth(USER_ROLE.admin), CouponController.createCoupon);
router.patch('/:id', auth(USER_ROLE.admin), CouponController.updateCoupon);
router.delete('/:id', auth(USER_ROLE.admin), CouponController.deleteCoupon);

export const CouponRoutes = router;
