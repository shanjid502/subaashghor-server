import { Schema, model, Document } from 'mongoose';

export interface ISiteConfig extends Document {
  key: string;
  value: unknown;
  updatedAt: Date;
}

const siteConfigSchema = new Schema<ISiteConfig>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

export const SiteConfigModel = model<ISiteConfig>('SiteConfig', siteConfigSchema);
