import express from 'express';
import multer from 'multer';
import auth from '../../middlewares/auth.middleware';
import { USER_ROLE } from '../Auth/auth.constant';
import { UploadController } from './upload.controller';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Admin upload route
router.post(
  '/',
  auth(USER_ROLE.admin),
  upload.single('file'),
  UploadController.uploadImage,
);

export const UploadRoutes = router;
