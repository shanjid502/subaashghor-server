import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { PostModel } from './post.model';

const getAllPosts = async (query: Record<string, any>) => {
  const { page = 1, limit = 12, featured, category } = query;

  const filterObj: Record<string, any> = { published: true };

  if (featured !== undefined) {
    filterObj.featured = featured === 'true';
  }

  // Matches category either in english or bengali
  if (category) {
    filterObj.$or = [
      { 'category.en': { $regex: category, $options: 'i' } },
      { 'category.bn': { $regex: category, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const posts = await PostModel.find(filterObj)
    .sort({ date: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await PostModel.countDocuments(filterObj);

  return {
    posts,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

const getPostBySlug = async (slug: string) => {
  const post = await PostModel.findOne({ slug, published: true });
  if (!post) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');
  }
  return post;
};

export const PostService = {
  getAllPosts,
  getPostBySlug,
};
