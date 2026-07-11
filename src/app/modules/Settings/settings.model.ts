import { Schema, model } from 'mongoose';
import { ISettings } from './settings.interface';
import { encrypt, decrypt } from '../../utils/encryption';

const settingsSchema = new Schema<ISettings>(
  {
    // --- Site Identity ---
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

    // --- 5.3 Native Pixel Integrations ---
    pixels: {
      ga4: { type: String, default: '' },
      fbPixel: { type: String, default: '' },
      fbCapiToken: { type: String, default: '', get: decrypt, set: encrypt },
      gtm: { type: String, default: '' },
      tiktok: { type: String, default: '' },
      clarity: { type: String, default: '' },
    },

    // --- 5.1 Script Injection ---
    scripts: {
      header: { type: String, default: '' },
      body: { type: String, default: '' },
      footer: { type: String, default: '' },
    },

    // --- 5.2 Server-side tracking ---
    taggingServerUrl: { type: String, default: '' },

    // --- 5.4 Mailchimp ---
    mailchimp: {
      apiKey: { type: String, default: '', get: decrypt, set: encrypt },
      listId: { type: String, default: '' },
    },

    // --- 5.5 Webhooks ---
    webhookUrl: { type: String, default: '', get: decrypt, set: encrypt },
    debugMode: { type: Boolean, default: false },

    // --- 5.6 Domain Verification ---
    domainVerificationToken: { type: String, default: '' },

    // --- 7.3 robots.txt Manager ---
    robotsTxt: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

export const SettingsModel = model<ISettings>('Settings', settingsSchema);
