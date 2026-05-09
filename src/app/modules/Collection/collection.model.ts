import { Schema, model, Document } from 'mongoose';

export interface ICollection extends Document {
  slug: string;
  name: { bn: string; en: string };
  description?: { bn: string; en: string };
  cover?: string;
  productCount?: number;
}

const bilingualSchema = new Schema({ bn: String, en: String }, { _id: false });

const collectionSchema = new Schema<ICollection>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: bilingualSchema, required: true },
    description: bilingualSchema,
    cover: String,
    productCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const CollectionModel = model<ICollection>('Collection', collectionSchema);
