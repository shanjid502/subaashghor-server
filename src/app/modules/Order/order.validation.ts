import { z } from 'zod';

const createOrderSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string().min(1, 'Product ID is required'),
        slug: z.string().min(1, 'Product slug is required'),
        name: z.string().min(1, 'Product name is required'),
        image: z.string().url('Product image must be a valid URL'),
        ml: z.number().min(1, 'Volume in ml is required'),
        price: z.number().min(0, 'Unit price must be positive'),
        qty: z.number().min(1, 'Quantity must be at least 1'),
      }),
    ),
    shipping: z.object({
      name: z.string().min(2, 'Name is required'),
      phone: z.string().min(10, 'Phone is required'),
      email: z.string().email('Invalid email address').optional().or(z.literal('')),
      address: z.string().min(5, 'Address is required'),
      area: z.string().min(2, 'Area is required'),
      city: z.string().min(2, 'City is required'),
      district: z.string().min(2, 'District is required'),
      postcode: z.string().optional(),
      notes: z.string().optional(),
    }),
    paymentMethod: z.enum(['cod', 'bkash']),
    couponCode: z.string().optional(),
  }),
});

export const OrderValidation = {
  createOrderSchema,
};
