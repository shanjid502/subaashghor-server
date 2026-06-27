import { z } from 'zod';

const createProductSchema = z.object({
  body: z.object({
    // TODO: Define fields
    // name: z.string().min(1, 'Name is required'),
  }),
});

const updateProductSchema = z.object({
  body: z.object({
    // TODO: Define update fields (all optional)
  }),
});

export const ProductValidation = {
  createProductSchema,
  updateProductSchema,
};
