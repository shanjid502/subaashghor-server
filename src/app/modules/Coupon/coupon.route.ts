import express from 'express';
import { CouponControllers } from './coupon.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post('/validate', CouponControllers.validateCoupon);
router.get('/', auth('admin'), CouponControllers.getAllCoupons);
router.post('/', auth('admin'), CouponControllers.createCoupon);

export const CouponRoutes = router;
