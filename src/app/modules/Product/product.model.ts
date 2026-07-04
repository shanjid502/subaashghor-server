import { Schema, model } from 'mongoose';
import { ISize, INoteItem, IProduct } from './product.interface';

const sizeSchema = new Schema<ISize>({
  ml: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  sku: { type: String, trim: true },
});

const noteItemSchema = new Schema<INoteItem>(
  {
    name: { type: String, required: true },
    icon: { type: String },
  },
  { _id: false },
);

const productSchema = new Schema<IProduct>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
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
      top: [noteItemSchema],
      heart: [noteItemSchema],
      base: [noteItemSchema],
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
    lowStockThreshold: { type: Number, default: 5 },

    // --- Module 08: AEO/SEO Readiness ---
    metaTitle: {
      bn: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    metaDescription: {
      bn: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    faqs: [
      {
        question: {
          bn: { type: String, default: '' },
          en: { type: String, default: '' },
        },
        answer: {
          bn: { type: String, default: '' },
          en: { type: String, default: '' },
        },
      },
    ],
    metaKeywords: { type: String, default: '' },
    canonicalUrl: { type: String, default: '' },
    socialImage: { type: String, default: '' },
    robotsMeta: {
      noindex: { type: Boolean, default: false },
      nofollow: { type: Boolean, default: false },
      noarchive: { type: Boolean, default: false },
    },
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
  'name.en': 'text',
  'name.bn': 'text',
  'tagline.en': 'text',
  'tagline.bn': 'text',
  tags: 'text',
});

export const ProductModel = model<IProduct>('Product', productSchema);
