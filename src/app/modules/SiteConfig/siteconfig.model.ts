import { Schema, model } from 'mongoose';
import { ISiteConfig } from './siteconfig.interface';

const siteConfigSchema = new Schema<ISiteConfig>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

export const SiteConfigModel = model<ISiteConfig>(
  'SiteConfig',
  siteConfigSchema,
);
