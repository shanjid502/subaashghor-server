import express from 'express';
import { AuthControllers } from './auth.controller';
import auth, { optionalAuth } from '../../middlewares/auth.middleware';
import validateRequest from '../../utils/validateRequest';
import { AuthValidation } from './auth.validation';
import { authRateLimiter } from '../../middlewares/rateLimiter.middleware';

const router = express.Router();

router.post(
  '/signup',
  authRateLimiter,
  validateRequest(AuthValidation.signupSchema),
  AuthControllers.signup,
);

router.post(
  '/login',
  authRateLimiter,
  validateRequest(AuthValidation.loginSchema),
  AuthControllers.login,
);

router.post(
  '/logout',
  AuthControllers.logout,
);

router.get(
  '/me',
  optionalAuth,
  AuthControllers.getMe,
);

router.post(
  '/forgot-password',
  authRateLimiter,
  validateRequest(AuthValidation.forgotPasswordSchema),
  AuthControllers.forgotPassword,
);

router.post(
  '/reset-password',
  authRateLimiter,
  validateRequest(AuthValidation.resetPasswordSchema),
  AuthControllers.resetPassword,
);

router.post(
  '/phone/request-otp',
  authRateLimiter,
  validateRequest(AuthValidation.requestOtpSchema),
  AuthControllers.requestOtp,
);

router.post(
  '/phone/verify-otp',
  authRateLimiter,
  validateRequest(AuthValidation.verifyOtpSchema),
  AuthControllers.verifyOtp,
);

export const AuthRoutes = router;
