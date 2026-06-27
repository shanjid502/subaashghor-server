import express from 'express';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth.middleware';
import validateRequest from '../../utils/validateRequest';
import { UserValidation } from './user.validation';

const router = express.Router();

router.patch(
  '/profile',
  auth('customer', 'admin'),
  validateRequest(UserValidation.updateProfileSchema),
  UserController.updateProfile,
);

router.get(
  '/addresses',
  auth('customer', 'admin'),
  UserController.getAddresses,
);

router.post(
  '/addresses',
  auth('customer', 'admin'),
  validateRequest(UserValidation.addressSchema),
  UserController.addAddress,
);

router.put(
  '/addresses/:index',
  auth('customer', 'admin'),
  validateRequest(UserValidation.addressSchema),
  UserController.updateAddress,
);

router.delete(
  '/addresses/:index',
  auth('customer', 'admin'),
  UserController.deleteAddress,
);

router.post(
  '/addresses/:index/default',
  auth('customer', 'admin'),
  UserController.setDefaultAddress,
);

export const UserRoutes = router;
