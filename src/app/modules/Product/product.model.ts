import { Schema, model } from 'mongoose';

export interface ISize {
  ml: number;
  price: number;
  salePrice?: number;
  stock: number;
  sku?: string;
}

export interface IProduct {
  _id?: string;
  slug: string;
  name: { bn: string; en: string };
  tagline: { bn: string; en: string };
  description?: { bn: string; en: string };
  images: string[];
  price: number;
  salePrice?: number;
  saleEndsAt?: Date;
  badge?: { bn: string; en: string };
  badges?: string[];
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  category: 'men' | 'women' | 'attar' | 'unisex';
  collections: string[];
  sizes: ISize[];
  rating?: number;
  reviewCount?: number;
  pairsWith?: string[];
  isActive?: boolean;
}

const sizeSchema = new Schema<ISize>({
  ml: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  sku: { type: String, trim: true },
});

const productSchema = new Schema<IProduct>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    name: {
      bn: { type: String, required: true },
      en: { type: String, required: true },
    },
    tagline: {
      bn: { type: String, required: true },
      en: { type: String, required: true },
    },
    description: {
      bn: String,
      en: String,
    },
    images: [{ type: String, required: true }],
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    saleEndsAt: Date,
    badge: {
      bn: String,
      en: String,
    },
    badges: [String],
    notes: {
      top: [{ type: String }],
      heart: [{ type: String }],
      base: [{ type: String }],
    },
    category: {
      type: String,
      enum: ['men', 'women', 'attar', 'unisex'],
      required: true,
      index: true,
    },
    collections: [{ type: String, index: true }],
    sizes: [sizeSchema],
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, default: 0 },
    pairsWith: [String],
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret: any) => {
        ret._id = String(ret._id);
        delete ret.id;
        return ret;
      },
    },
  },
);

// Create compound text index for search support
productSchema.index({
  "name.en": "text",
  "name.bn": "text",
  "tagline.en": "text",
  "tagline.bn": "text",
  tags: "text",
});

export const ProductModel = model<IProduct>('Product', productSchema);
