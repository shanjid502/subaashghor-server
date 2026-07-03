import express from 'express';
import { SettingsController } from './settings.controller';
import auth from '../../middlewares/auth.middleware';
import { USER_ROLE } from '../Auth/auth.constant';
import validateRequest from '../../utils/validateRequest';
import { SettingsValidation } from './settings.validation';

const router = express.Router();

router.get('/', SettingsController.getSettings);
router.patch(
  '/',
  auth(USER_ROLE.admin),
  validateRequest(SettingsValidation.updateSettingsSchema),
  SettingsController.updateSettings,
);

export const SettingsRoutes = router;
