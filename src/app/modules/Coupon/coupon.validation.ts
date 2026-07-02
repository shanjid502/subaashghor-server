import { z } from 'zod';

const validateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Coupon code cannot be empty'),
    subtotal: z.number().min(0, 'Subtotal must be positive'),
  }),
});

const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Coupon code cannot be empty'),
    type: z.enum(['flat', 'percent']),
    value: z.number().min(0, 'Value must be at least 0'),
    minSubtotal: z.number().min(0, 'Minimum subtotal must be at least 0').optional(),
    maxDiscount: z.number().min(0, 'Maximum discount must be at least 0').optional(),
    expiresAt: z.string().datetime({ message: 'Invalid ISO date string format' }).or(z.date()).optional(),
    active: z.boolean().default(true).optional(),
  }),
});

const updateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Coupon code cannot be empty').optional(),
    type: z.enum(['flat', 'percent']).optional(),
    value: z.number().min(0, 'Value must be at least 0').optional(),
    minSubtotal: z.number().min(0, 'Minimum subtotal must be at least 0').optional(),
    maxDiscount: z.number().min(0, 'Maximum discount must be at least 0').optional(),
    expiresAt: z.string().datetime().or(z.date()).optional(),
    active: z.boolean().optional(),
  }),
});

export const CouponValidation = {
  validateCouponSchema,
  createCouponSchema,
  updateCouponSchema,
};
