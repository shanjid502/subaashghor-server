import express from 'express';
import { ProfileControllers } from './profile.controller';
import auth from '../../middlewares/auth';
import multer from 'multer';
import { cloudinaryStorage } from '../../config/cloudinary.config';

const router = express.Router();

const upload = multer({ storage: cloudinaryStorage });

router.get('/', auth('customer', 'admin'), ProfileControllers.getProfile);
router.patch('/', auth('customer', 'admin'), ProfileControllers.updateProfile);
router.post(
  '/avatar',
  auth('customer', 'admin'),
  upload.single('file'),
  ProfileControllers.updateAvatar,
);

export const ProfileRoutes = router;
