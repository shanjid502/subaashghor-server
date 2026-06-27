import express from 'express';
import { ReviewControllers } from './review.controller';

const router = express.Router();

router.post('/', ReviewControllers.createReview);
router.get('/', ReviewControllers.getAllReviews);
router.get('/:id', ReviewControllers.getSingleReview);
router.patch('/:id', ReviewControllers.updateReview);
router.delete('/:id', ReviewControllers.deleteReview);

export const ReviewRoutes = router;
