import express from 'express';
import { SettingsController } from './settings.controller';
import auth from '../../middlewares/auth.middleware';
import { USER_ROLE } from '../Auth/auth.constant';

const router = express.Router();

router.get('/', SettingsController.getSettings);
router.patch('/', auth(USER_ROLE.admin), SettingsController.updateSettings);

export const SettingsRoutes = router;
