import { z } from 'zod';

const createReviewSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
    title: z.string().max(120).optional(),
    body: z.string().min(5, 'Review body must be at least 5 characters'),
    photos: z.array(z.string().url()).optional(),
  }),
});

export const ReviewValidation = {
  createReviewSchema,
};
