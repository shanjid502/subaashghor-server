import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ReviewService } from './review.service';

const getReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getReviews(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reviews fetched successfully',
    data: result,
  });
});

const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.createReview(req.user!.userId, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Review submitted successfully',
    data: result,
  });
});

const getFeaturedReviews = catchAsync(async (_req: Request, res: Response) => {
  const result = await ReviewService.getFeaturedReviews();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Featured testimonials fetched successfully',
    data: result,
  });
});

export const ReviewController = {
  getReviews,
  createReview,
  getFeaturedReviews,
};
