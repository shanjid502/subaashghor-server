import { Schema, model } from 'mongoose';
import { IProduct } from './product.interface';

const bilingualSchema = new Schema(
  {
    en: { type: String, required: true },
    bn: { type: String, required: true },
  },
  { _id: false },
);

const sizeSchema = new Schema(
  {
    ml: { type: Number, required: true },
    price: { type: Number, required: true },
    salePrice: Number,
    stock: { type: Number, default: 0 },
  },
  { _id: false },
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: bilingualSchema, required: true },
    tagline: { type: bilingualSchema, required: true },
    description: { type: bilingualSchema, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    collections: { type: [String], default: [] },
    images: { type: [String], default: [] },
    sizes: { type: [sizeSchema], required: true },
    notes: {
      top: { type: [String], default: [] },
      heart: { type: [String], default: [] },
      base: { type: [String], default: [] },
    },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({
  'name.en': 'text',
  'name.bn': 'text',
  description: 'text',
});

export const ProductModel = model<IProduct>('Product', productSchema);
