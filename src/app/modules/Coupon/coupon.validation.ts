import { z } from 'zod';

const createCouponSchema = z.object({
  body: z.object({
    // TODO: Define fields
    // name: z.string().min(1, 'Name is required'),
  }),
});

const updateCouponSchema = z.object({
  body: z.object({
    // TODO: Define update fields (all optional)
  }),
});

export const CouponValidation = {
  createCouponSchema,
  updateCouponSchema,
};
