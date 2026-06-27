import { z } from 'zod';

const createPostSchema = z.object({
  body: z.object({
    // TODO: Define fields
    // name: z.string().min(1, 'Name is required'),
  }),
});

const updatePostSchema = z.object({
  body: z.object({
    // TODO: Define update fields (all optional)
  }),
});

export const PostValidation = {
  createPostSchema,
  updatePostSchema,
};
