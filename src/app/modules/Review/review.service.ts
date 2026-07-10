import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { ReviewModel } from './review.model';
import { IReview } from './review.interface';
import { UserModel } from '../Auth/auth.model';
import { ProductModel } from '../Product/product.model';

const updateProductStats = async (productId: string) => {
  const product = await ProductModel.findById(productId);
  if (!product) return;

  const allReviews = await ReviewModel.find({
    productId,
    status: 'published',
  });

  if (allReviews.length === 0) {
    product.rating = 0;
    product.reviewCount = 0;
  } else {
    const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
    product.rating = Number((totalRating / allReviews.length).toFixed(1));
    product.reviewCount = allReviews.length;
  }
  await product.save();
};

const getReviews = async (query: Record<string, any>) => {
  const { productId, productSlug, status, all } = query;

  const filterObj: Record<string, any> = {};

  if (all === 'true' || all === true) {
    if (status) {
      filterObj.status = status;
    }
  } else {
    filterObj.status = 'published';
  }

  if (productId) {
    filterObj.productId = productId;
  } else if (productSlug) {
    filterObj.productSlug = productSlug;
  } else if (all !== 'true' && all !== true) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Product identifier is required',
    );
  }

  const reviews = await ReviewModel.find(filterObj)
    .populate('productId', 'name slug image')
    .sort({ createdAt: -1 });
  return reviews;
};

const createReview = async (userId: string, payload: any) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const isAdmin = user.role === 'admin';

  if (!isAdmin) {
    // Check if review already exists (only for regular customers)
    const existingReview = await ReviewModel.findOne({
      productId: payload.productId,
      userId,
    });

    if (existingReview) {
      throw new AppError(
        StatusCodes.CONFLICT,
        'You have already reviewed this product',
      );
    }
  }

  const product = await ProductModel.findById(payload.productId);
  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  const name = isAdmin && payload.userName ? payload.userName : user.name;
  const location = isAdmin && payload.userLocation
    ? payload.userLocation
    : (user.addresses?.[0]?.city || 'Dhaka');

  const newReview = await ReviewModel.create({
    productId: payload.productId,
    productSlug: product.slug,
    userId: isAdmin ? undefined : userId, // Do not tie manually created admin reviews to the admin's own user ID
    userName: name,
    userLocation: location,
    rating: payload.rating,
    title: payload.title,
    body: payload.body,
    photos: payload.photos || [],
    status: 'published', // Automatically publish for immediate storefront feedback
  });

  await updateProductStats(payload.productId);

  return newReview;
};

const updateReview = async (reviewId: string, payload: Partial<IReview>) => {
  const review = await ReviewModel.findById(reviewId);
  if (!review) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Review not found');
  }

  if (payload.status !== undefined) review.status = payload.status;
  if (payload.featured !== undefined) review.featured = payload.featured;
  if (payload.rating !== undefined) review.rating = payload.rating;
  if (payload.body !== undefined) review.body = payload.body;

  await review.save();
  await updateProductStats(String(review.productId));

  return review;
};

const deleteReview = async (reviewId: string) => {
  const review = await ReviewModel.findById(reviewId);
  if (!review) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Review not found');
  }

  await ReviewModel.findByIdAndDelete(reviewId);
  await updateProductStats(String(review.productId));

  return { id: reviewId };
};

const getFeaturedReviews = async () => {
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
  updateReview,
  deleteReview,
  getFeaturedReviews,
};
