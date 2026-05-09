import express from 'express';
import { ReviewControllers } from './review.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.get('/', ReviewControllers.getReviews);
router.post('/', auth('customer', 'admin'), ReviewControllers.submitReview);
router.patch('/:id/status', auth('admin'), ReviewControllers.moderateReview);

export const ReviewRoutes = router;
