import { z } from 'zod';

const subscribeSchema = z.object({
  body: z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
  }),
});

export const NewsletterValidation = {
  subscribeSchema,
};
