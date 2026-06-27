import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PostService } from './post.service';

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.getAllPosts(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Posts fetched successfully',
    data: result.posts,
    meta: result.meta,
  });
});

const getPostBySlug = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.getPostBySlug(req.params.slug);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Post details fetched successfully',
    data: result,
  });
});

export const PostController = {
  getAllPosts,
  getPostBySlug,
};
