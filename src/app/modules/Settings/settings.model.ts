import { Schema, model } from 'mongoose';
import { ISettings } from './settings.interface';

const settingsSchema = new Schema<ISettings>(
  {
    title: { type: String, required: true, default: 'Subaashghor — A House of Pure Fragrance' },
    taglineBn: { type: String, default: 'একটি বিশুদ্ধ সুবাসের ঐতিহ্য' },
    logoUrl: { type: String, default: '/assets/logo.svg' },
    faviconUrl: { type: String, default: '/favicon.ico' },
    announcement: { type: String, default: 'Free delivery on orders over ৳3,000' },
    whatsapp: { type: String, default: '+880 1700 000000' },
    email: { type: String, default: 'hello@subaashghor.com' },
    address: { type: String, default: 'House 12, Road 5, Dhanmondi, Dhaka' },
    facebook: { type: String, default: 'https://facebook.com/subaashghor' },
    instagram: { type: String, default: 'https://instagram.com/subaashghor' },
    maintenanceMode: { type: Boolean, default: false },
    pixels: {
      ga4: { type: String, default: '' },
      fbPixel: { type: String, default: '' },
      gtm: { type: String, default: '' },
      tiktok: { type: String, default: '' },
    },
    scripts: {
      header: { type: String, default: '' },
      body: { type: String, default: '' },
      footer: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

export const SettingsModel = model<ISettings>('Settings', settingsSchema);
