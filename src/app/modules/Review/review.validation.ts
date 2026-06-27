import { z } from 'zod';

const createReviewSchema = z.object({
  body: z.object({
    // TODO: Define fields
    // name: z.string().min(1, 'Name is required'),
  }),
});

const updateReviewSchema = z.object({
  body: z.object({
    // TODO: Define update fields (all optional)
  }),
});

export const ReviewValidation = {
  createReviewSchema,
  updateReviewSchema,
};
