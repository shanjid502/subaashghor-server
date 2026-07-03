import { z } from 'zod';

const updateSettingsSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Site title cannot be empty').optional(),
    taglineBn: z.string().optional(),
    logoUrl: z.string().optional(),
    faviconUrl: z.string().optional(),
    announcement: z.string().optional(),
    whatsapp: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    maintenanceMode: z.boolean().optional(),
    pixels: z.object({
      ga4: z.string().optional(),
      fbPixel: z.string().optional(),
      gtm: z.string().optional(),
      tiktok: z.string().optional(),
    }).optional(),
    scripts: z.object({
      header: z.string().optional(),
      body: z.string().optional(),
      footer: z.string().optional(),
    }).optional(),
  }),
});

export const SettingsValidation = {
  updateSettingsSchema,
};
