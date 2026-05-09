import { ReviewModel } from './review.model';
import { ProductModel } from '../Product/product.model';

const getReviewsByProduct = async (productId: string) => {
  return ReviewModel.find({ productId, status: 'published' }).sort({ createdAt: -1 }).lean();
};

const submitReview = async (payload: {
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  body: string;
}) => {
  const review = await ReviewModel.create({ ...payload, status: 'pending' });

  // Recompute product rating from published reviews
  await updateProductRating(payload.productId);

  return review;
};

const updateReviewStatus = async (reviewId: string, status: 'published' | 'rejected') => {
  const review = await ReviewModel.findByIdAndUpdate(reviewId, { status }, { new: true });
  if (review) await updateProductRating(review.productId);
  return review;
};

const updateProductRating = async (productId: string) => {
  const result = await ReviewModel.aggregate([
    { $match: { productId, status: 'published' } },
    {
      $group: {
        _id: '$productId',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await ProductModel.findByIdAndUpdate(productId, {
      rating: Math.round(result[0].avgRating * 10) / 10,
      reviewCount: result[0].count,
    });
  }
};

export const ReviewService = { getReviewsByProduct, submitReview, updateReviewStatus };
