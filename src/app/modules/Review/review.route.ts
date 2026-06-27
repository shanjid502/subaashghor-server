import express from 'express';
import { ReviewController } from './review.controller';
import auth from '../../middlewares/auth.middleware';
import validateRequest from '../../utils/validateRequest';
import { ReviewValidation } from './review.validation';

const router = express.Router();

router.get('/', ReviewController.getReviews);
router.get('/featured', ReviewController.getFeaturedReviews);
router.post(
  '/',
  auth('customer', 'admin'),
  validateRequest(ReviewValidation.createReviewSchema),
  ReviewController.createReview,
);

export const ReviewRoutes = router;
