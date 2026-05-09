import express from 'express';
import { AuthControllers } from './auth.controller';
import { AuthValidation } from './auth.validation';
import validateRequest from '../../utils/validateRequest';
import auth from '../../middlewares/auth';

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
router.post('/logout', AuthControllers.logout);
router.get('/me', auth('optional'), AuthControllers.getMe);
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

export const AuthRoutes = router;
