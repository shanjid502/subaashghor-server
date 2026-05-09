import { z } from 'zod';

const createWishlistSchema = z.object({
  body: z.object({
    // TODO: Define fields
    // name: z.string({ required_error: 'Name is required' }).min(1),
  }),
});

const updateWishlistSchema = z.object({
  body: z.object({
    // TODO: Define update fields (all optional)
  }),
});

export const WishlistValidation = {
  createWishlistSchema,
  updateWishlistSchema,
};
