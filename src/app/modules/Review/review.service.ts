import { IReview } from './review.interface';

const createReview = async (payload: IReview) => {
  // TODO: Implement create logic
  return payload;
};

const getAllReviews = async (query: Record<string, unknown>) => {
  // TODO: Implement list logic (with filtering, sorting, pagination)
  return [];
};

const getSingleReview = async (id: string) => {
  // TODO: Implement find-by-id logic
  return null;
};

const updateReview = async (id: string, payload: Partial<IReview>) => {
  // TODO: Implement update logic
  return null;
};

const deleteReview = async (id: string) => {
  // TODO: Implement delete logic
  return null;
};

export const ReviewService = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
};
