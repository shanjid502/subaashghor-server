import { z } from 'zod';

const bangladeshiPhoneRegex = /^(?:\+8801|01)[3-9]\d{8}$/;

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().regex(bangladeshiPhoneRegex, 'Invalid Bangladeshi phone number').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  }).refine((data) => data.email || data.phone, {
    message: 'Either email or phone is required to log in',
    path: ['email'],
  }),
});

const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    phone: z.string().regex(bangladeshiPhoneRegex, 'Invalid Bangladeshi phone number'),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().regex(bangladeshiPhoneRegex, 'Invalid Bangladeshi phone number').optional(),
  }).refine((data) => data.email || data.phone, {
    message: 'Either email or phone is required to request reset',
    path: ['phone'],
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().optional(),
    phone: z.string().regex(bangladeshiPhoneRegex, 'Invalid Bangladeshi phone number').optional(),
    code: z.string().min(4, 'OTP must be at least 4 digits').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

const requestOtpSchema = z.object({
  body: z.object({
    phone: z.string().regex(bangladeshiPhoneRegex, 'Invalid Bangladeshi phone number'),
    purpose: z.enum(['login', 'signup', 'verify', 'reset-password']).optional(),
  }),
});

const verifyOtpSchema = z.object({
  body: z.object({
    phone: z.string().regex(bangladeshiPhoneRegex, 'Invalid Bangladeshi phone number'),
    code: z.string().min(4, 'OTP must be at least 4 digits'),
    purpose: z.enum(['login', 'signup', 'verify', 'reset-password']).optional(),
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
