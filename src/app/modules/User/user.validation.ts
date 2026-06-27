import { z } from 'zod';

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    avatarUrl: z.string().url().optional(),
  }),
});

const addressSchema = z.object({
  body: z.object({
    label: z.string().optional(),
    name: z.string().min(2, 'Name is required'),
    phone: z.string().min(10, 'Phone is required'),
    address: z.string().min(5, 'Address is required'),
    area: z.string().min(2, 'Area is required'),
    city: z.string().min(2, 'City is required'),
    district: z.string().min(2, 'District is required'),
    postcode: z.string().optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const UserValidation = {
  updateProfileSchema,
  addressSchema,
};
