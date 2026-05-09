import { z } from 'zod';

const createNewslatterSchema = z.object({
  body: z.object({
    // TODO: Define fields
    // name: z.string({ required_error: 'Name is required' }).min(1),
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
