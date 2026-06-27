import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { ReviewModel } from './review.model';
import { UserModel } from '../Auth/auth.model';
import { ProductModel } from '../Product/product.model';

const getReviews = async (query: Record<string, any>) => {
  const { productId, productSlug } = query;

  const filterObj: Record<string, any> = { status: 'published' };

  if (productId) {
    filterObj.productId = productId;
  } else if (productSlug) {
    filterObj.productSlug = productSlug;
  } else {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Product identifier is required');
  }

  const reviews = await ReviewModel.find(filterObj).sort({ createdAt: -1 });
  return reviews;
};

const createReview = async (userId: string, payload: any) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // Check if review already exists
  const existingReview = await ReviewModel.findOne({
    productId: payload.productId,
    userId,
  });

  if (existingReview) {
    throw new AppError(StatusCodes.CONFLICT, 'You have already reviewed this product');
  }

  const product = await ProductModel.findById(payload.productId);
  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  const location = user.addresses?.[0]?.city || 'Dhaka';

  const newReview = await ReviewModel.create({
    productId: payload.productId,
    productSlug: product.slug,
    userId,
    userName: user.name,
    userLocation: location,
    rating: payload.rating,
    title: payload.title,
    body: payload.body,
    photos: payload.photos || [],
    status: 'published', // Automatically publish for immediate storefront feedback
  });

  // Recalculate Product average rating & count
  const allReviews = await ReviewModel.find({
    productId: payload.productId,
    status: 'published',
  });

  const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
  product.rating = Number((totalRating / allReviews.length).toFixed(1));
  product.reviewCount = allReviews.length;
  await product.save();

  return newReview;
};

const getFeaturedReviews = async () => {
  // Returns featured 5-star reviews or latest high rating reviews
  const featured = await ReviewModel.find({
    status: 'published',
    rating: { $gte: 4 },
  })
    .sort({ featured: -1, createdAt: -1 })
    .limit(6);

  return featured;
};

export const ReviewService = {
  getReviews,
  createReview,
  getFeaturedReviews,
};
