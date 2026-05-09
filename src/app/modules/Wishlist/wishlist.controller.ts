import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { WishlistService } from './wishlist.service';

const getWishlist = catchAsync(async (req: Request, res: Response) => {
  const data = await WishlistService.getWishlist(req.user.userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Wishlist fetched.',
    data,
  });
});

const addToWishlist = catchAsync(async (req: Request, res: Response) => {
  const data = await WishlistService.addToWishlist(
    req.user.userId,
    req.body.slug,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Added to wishlist.',
    data,
  });
});

const removeFromWishlist = catchAsync(async (req: Request, res: Response) => {
  const data = await WishlistService.removeFromWishlist(
    req.user.userId,
    req.params.slug,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Removed from wishlist.',
    data,
  });
});

export const WishlistControllers = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
