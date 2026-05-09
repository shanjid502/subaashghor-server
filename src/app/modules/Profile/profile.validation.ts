import { z } from 'zod';

const createProfileSchema = z.object({
  body: z.object({
    // TODO: Define fields
    // name: z.string({ required_error: 'Name is required' }).min(1),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    // TODO: Define update fields (all optional)
  }),
});

export const ProfileValidation = {
  createProfileSchema,
  updateProfileSchema,
};
