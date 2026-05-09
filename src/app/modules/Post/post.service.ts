import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { PostModel } from './post.model';

const getAllPosts = async () => {
  return PostModel.find({ isPublished: true }).sort('-date').lean();
};

const getPostBySlug = async (slug: string) => {
  const post = await PostModel.findOne({ slug, isPublished: true }).lean();
  if (!post) throw new AppError(StatusCodes.NOT_FOUND, 'Post not found.');
  return post;
};

const createPost = async (payload: unknown) => PostModel.create(payload as object);

const updatePost = async (slug: string, payload: unknown) => {
  const post = await PostModel.findOneAndUpdate({ slug } as object, payload as object, { new: true });
  if (!post) throw new AppError(StatusCodes.NOT_FOUND, 'Post not found.');
  return post;
};

export const PostService = { getAllPosts, getPostBySlug, createPost, updatePost };
