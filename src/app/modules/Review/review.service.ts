import { ReviewModel } from './review.model';
import { updateProductRating } from './review.utils';

const getReviewsByProduct = async (productId: string) => {
  return ReviewModel.find({ productId, status: 'approved' })
    .sort('-createdAt')
    .lean();
};

const submitReview = async (payload: {
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
}) => {
  const review = await ReviewModel.create({ ...payload, status: 'pending' });

  // Recompute product rating
  await updateProductRating(payload.productId);

  return review;
};

const updateReviewStatus = async (
  reviewId: string,
  status: 'approved' | 'rejected',
) => {
  const review = await ReviewModel.findByIdAndUpdate(
    reviewId,
    { status },
    { new: true },
  );
  if (review) await updateProductRating(review.productId);
  return review;
};

export const ReviewService = {
  getReviewsByProduct,
  submitReview,
  updateReviewStatus,
};
