import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PostService } from './post.service';

const getAllPosts = catchAsync(async (_req, res: Response) => {
  const data = await PostService.getAllPosts();
  res.set('Cache-Control', 'public, max-age=300');
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Posts fetched.',
    data,
  });
});

const getPostBySlug = catchAsync(async (req: Request, res: Response) => {
  const data = await PostService.getPostBySlug(req.params.slug);
  res.set('Cache-Control', 'public, max-age=300');
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Post fetched.',
    data,
  });
});

const createPost = catchAsync(async (req: Request, res: Response) => {
  const data = await PostService.createPost(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Post created.',
    data,
  });
});

const updatePost = catchAsync(async (req: Request, res: Response) => {
  const data = await PostService.updatePost(req.params.slug, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Post updated.',
    data,
  });
});

export const PostControllers = {
  getAllPosts,
  getPostBySlug,
  createPost,
  updatePost,
};
