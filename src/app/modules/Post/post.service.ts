import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { PostModel } from './post.model';
import { pingSitemapToGoogle } from '../../utils/sitemapGenerator';

const getAllPosts = async (query: Record<string, any>) => {
  const { page = 1, limit = 100, featured, category, isAdmin = false } = query;

  const filterObj: Record<string, any> = {};

  if (isAdmin !== 'true') {
    filterObj.published = true;
    // Module 09: Scheduled Publishing — hide future-dated posts from public
    filterObj.date = { $lte: new Date() };
  }

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
    .limit(Number(limit))
    .populate('relatedProducts', 'title slug cover variants');

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
  const post = await PostModel.findOne({ slug })
    .populate('relatedProducts', 'title slug cover variants');
  if (!post) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');
  }
  return post;
};

const createPost = async (payload: any) => {
  if (!payload.slug && payload.title?.en) {
    payload.slug = payload.title.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  const existing = await PostModel.findOne({ slug: payload.slug });
  if (existing) {
    throw new AppError(StatusCodes.CONFLICT, 'Post with this slug already exists');
  }

  if (!payload.date) {
    payload.date = new Date();
  }

  const result = await PostModel.create(payload);
  setImmediate(() => pingSitemapToGoogle());
  return result;
};

const updatePost = async (id: string, payload: any) => {
  const result = await PostModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');
  }

  setImmediate(() => pingSitemapToGoogle());
  return result;
};

const deletePost = async (id: string) => {
  const result = await PostModel.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');
  }
  setImmediate(() => pingSitemapToGoogle());
  return result;
};

export const PostService = {
  getAllPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
};
