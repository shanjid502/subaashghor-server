import { z } from 'zod';

const createUserSchema = z.object({
  body: z.object({
    // TODO: Define fields
    // name: z.string().min(1, 'Name is required'),
  }),
});

const updateUserSchema = z.object({
  body: z.object({
    // TODO: Define update fields (all optional)
  }),
});

export const UserValidation = {
  createUserSchema,
  updateUserSchema,
};
