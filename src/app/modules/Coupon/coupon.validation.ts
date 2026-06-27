import { z } from 'zod';

const validateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Coupon code is required'),
    subtotal: z.number().min(0, 'Subtotal must be positive'),
  }),
});

export const CouponValidation = {
  validateCouponSchema,
};
