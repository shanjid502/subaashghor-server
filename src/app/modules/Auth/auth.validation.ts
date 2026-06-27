import { z } from 'zod';

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

const requestOtpSchema = z.object({
  body: z.object({
    phone: z.string().min(10, 'Invalid phone number'),
  }),
});

const verifyOtpSchema = z.object({
  body: z.object({
    phone: z.string().min(10, 'Invalid phone number'),
    code: z.string().min(4, 'OTP must be at least 4 digits'),
  }),
});

export const AuthValidation = {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  requestOtpSchema,
  verifyOtpSchema,
};
