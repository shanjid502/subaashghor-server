import express from 'express';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth.middleware';
import validateRequest from '../../utils/validateRequest';
import { UserValidation } from './user.validation';
import { USER_ROLE } from '../Auth/auth.constant';

const router = express.Router();

router.patch(
  '/profile',
  auth(USER_ROLE.customer, USER_ROLE.admin),
  validateRequest(UserValidation.updateProfileSchema),
  UserController.updateProfile,
);

router.get(
  '/addresses',
  auth(USER_ROLE.customer, USER_ROLE.admin),
  UserController.getAddresses,
);

router.post(
  '/addresses',
  auth(USER_ROLE.customer, USER_ROLE.admin),
  validateRequest(UserValidation.addressSchema),
  UserController.addAddress,
);

router.put(
  '/addresses/:index',
  auth(USER_ROLE.customer, USER_ROLE.admin),
  validateRequest(UserValidation.addressSchema),
  UserController.updateAddress,
);

router.delete(
  '/addresses/:index',
  auth(USER_ROLE.customer, USER_ROLE.admin),
  UserController.deleteAddress,
);

router.post(
  '/addresses/:index/default',
  auth(USER_ROLE.customer, USER_ROLE.admin),
  UserController.setDefaultAddress,
);

router.get(
  '/users',
  auth(USER_ROLE.admin),
  UserController.getAllUsers,
);

export const UserRoutes = router;
