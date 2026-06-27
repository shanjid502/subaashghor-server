import { z } from 'zod';

const createNewslatterSchema = z.object({
  body: z.object({
    // TODO: Define fields
    // name: z.string().min(1, 'Name is required'),
  }),
});

const updateNewslatterSchema = z.object({
  body: z.object({
    // TODO: Define update fields (all optional)
  }),
});

export const NewslatterValidation = {
  createNewslatterSchema,
  updateNewslatterSchema,
};
