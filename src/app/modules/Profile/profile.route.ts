import express from 'express';
import { ProfileControllers } from './profile.controller';
import auth from '../../middlewares/auth';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Profile
router.get('/', auth('customer', 'admin'), ProfileControllers.getProfile);
router.patch('/', auth('customer', 'admin'), ProfileControllers.updateProfile);
router.post(
  '/avatar',
  auth('customer', 'admin'),
  upload.single('file'),
  ProfileControllers.updateAvatar,
);

export const ProfileRoutes = router;
