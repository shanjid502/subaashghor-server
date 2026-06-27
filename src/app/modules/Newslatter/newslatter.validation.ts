import { z } from 'zod';

const subscribeSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const NewslatterValidation = {
  subscribeSchema,
};
