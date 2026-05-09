import { Schema, model } from 'mongoose';
import { ICollection } from './collection.interface';

const bilingualSchema = new Schema(
  {
    en: { type: String, required: true },
    bn: { type: String, required: true },
  },
  { _id: false },
);

const collectionSchema = new Schema<ICollection>(
  {
    name: { type: bilingualSchema, required: true },
    slug: { type: String, required: true, unique: true },
    image: String,
    description: bilingualSchema,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const CollectionModel = model<ICollection>(
  'Collection',
  collectionSchema,
);
