import { z } from 'zod';

const createCollectionSchema = z.object({
  body: z.object({
    // TODO: Define fields
    // name: z.string().min(1, 'Name is required'),
  }),
});

const updateCollectionSchema = z.object({
  body: z.object({
    // TODO: Define update fields (all optional)
  }),
});

export const CollectionValidation = {
  createCollectionSchema,
  updateCollectionSchema,
};
