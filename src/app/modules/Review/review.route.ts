import express from 'express';
import { ReviewController } from './review.controller';
import auth from '../../middlewares/auth.middleware';
import validateRequest from '../../utils/validateRequest';
import { ReviewValidation } from './review.validation';
import { USER_ROLE } from '../Auth/auth.constant';

const router = express.Router();

router.get('/', ReviewController.getReviews);
router.get('/featured', ReviewController.getFeaturedReviews);
router.post(
  '/',
  auth(USER_ROLE.customer, USER_ROLE.admin),
  validateRequest(ReviewValidation.createReviewSchema),
  ReviewController.createReview,
);
router.patch(
  '/:id',
  auth(USER_ROLE.admin),
  ReviewController.updateReview,
);
router.delete(
  '/:id',
  auth(USER_ROLE.admin),
  ReviewController.deleteReview,
);

export const ReviewRoutes = router;
