import { Schema, model, Document } from 'mongoose';

export interface IProductSize {
  ml: number;
  price: number;
  salePrice?: number;
  stock: number;
  sku?: string;
}

export interface IProduct extends Document {
  slug: string;
  name: { bn: string; en: string };
  tagline: { bn: string; en: string };
  description?: { bn: string; en: string };
  images: string[];
  price: number;
  salePrice?: number;
  badge?: { bn: string; en: string };
  notes: { top: string[]; heart: string[]; base: string[] };
  category: 'men' | 'women' | 'attar' | 'unisex';
  collections: string[];
  sizes: IProductSize[];
  rating?: number;
  reviewCount?: number;
  isActive: boolean;
  createdAt: Date;
}

const bilingualSchema = new Schema({ bn: String, en: String }, { _id: false });

const productSizeSchema = new Schema<IProductSize>(
  {
    ml: { type: Number, required: true },
    price: { type: Number, required: true },
    salePrice: Number,
    stock: { type: Number, default: 0, min: 0 },
    sku: String,
  },
  { _id: false },
);

const productSchema = new Schema<IProduct>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: bilingualSchema, required: true },
    tagline: { type: bilingualSchema, required: true },
    description: bilingualSchema,
    images: { type: [String], default: [] },
    price: { type: Number, required: true },
    salePrice: Number,
    badge: bilingualSchema,
    notes: {
      top: { type: [String], default: [] },
      heart: { type: [String], default: [] },
      base: { type: [String], default: [] },
    },
    category: {
      type: String,
      enum: ['men', 'women', 'attar', 'unisex'],
      required: true,
    },
    collections: { type: [String], default: [] },
    sizes: { type: [productSizeSchema], default: [] },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

productSchema.index({ slug: 1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ 'name.en': 'text', 'name.bn': 'text' });

export const ProductModel = model<IProduct>('Product', productSchema);
