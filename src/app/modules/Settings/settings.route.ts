import express, { Request, Response } from 'express';
import { SettingsController } from './settings.controller';
import auth from '../../middlewares/auth.middleware';
import { USER_ROLE } from '../Auth/auth.constant';
import validateRequest from '../../utils/validateRequest';
import { SettingsValidation } from './settings.validation';
import { SettingsModel } from './settings.model';

const router = express.Router();

router.get('/', SettingsController.getSettings);
router.patch(
  '/',
  auth(USER_ROLE.admin),
  validateRequest(SettingsValidation.updateSettingsSchema),
  SettingsController.updateSettings,
);

// 5.6 Domain verification: serves token stored in Settings DB
router.get('/verify/domain', async (_req: Request, res: Response) => {
  const settings = await SettingsModel.findOne().lean();
  const token = (settings as any)?.domainVerificationToken || '';
  if (!token) {
    res.status(404).send('No verification token configured.');
    return;
  }
  res.type('text/html').send(token);
});

export const SettingsRoutes = router;

