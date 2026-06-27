import express from 'express';
import { AuthControllers } from './auth.controller';
import auth, { optionalAuth } from '../../middlewares/auth.middleware';
import validateRequest from '../../utils/validateRequest';
import { AuthValidation } from './auth.validation';

const router = express.Router();

router.post(
  '/signup',
  validateRequest(AuthValidation.signupSchema),
  AuthControllers.signup,
);

router.post(
  '/login',
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
  validateRequest(AuthValidation.forgotPasswordSchema),
  AuthControllers.forgotPassword,
);

router.post(
  '/reset-password',
  validateRequest(AuthValidation.resetPasswordSchema),
  AuthControllers.resetPassword,
);

router.post(
  '/phone/request-otp',
  validateRequest(AuthValidation.requestOtpSchema),
  AuthControllers.requestOtp,
);

router.post(
  '/phone/verify-otp',
  validateRequest(AuthValidation.verifyOtpSchema),
  AuthControllers.verifyOtp,
);

export const AuthRoutes = router;
