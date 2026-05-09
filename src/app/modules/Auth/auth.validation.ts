import { z } from 'zod';

const loginSchema = z.object({
  body: z.object({
    email: z.email('Invalid email format'),
    password: z
      .string({ message: 'Password is required' })
      .min(6, 'Min 6 characters'),
  }),
});

export const AuthValidation = { loginSchema };
