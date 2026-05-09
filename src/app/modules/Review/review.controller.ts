import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ReviewService } from './review.service';
import { UserModel } from '../Auth/auth.model';

const getReviews = catchAsync(async (req: Request, res: Response) => {
  const data = await ReviewService.getReviewsByProduct(
    req.query.productId as string,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reviews fetched.',
    data,
  });
});

const submitReview = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const user = await UserModel.findById(userId);
  const data = await ReviewService.submitReview({
    ...req.body,
    userId,
    userName: user?.name ?? 'Anonymous',
  });
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Review submitted. It will appear after moderation.',
    data,
  });
});

const moderateReview = catchAsync(async (req: Request, res: Response) => {
  const data = await ReviewService.updateReviewStatus(
    req.params.id,
    req.body.status,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review moderated.',
    data,
  });
});

export const ReviewControllers = { getReviews, submitReview, moderateReview };
