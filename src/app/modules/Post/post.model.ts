import { Schema, model, Types } from 'mongoose';

export interface IPost {
  _id?: string;
  slug: string;
  title: { bn: string; en: string };
  excerpt: { bn: string; en: string };
  content?: { bn: string; en: string };
  category: { bn: string; en: string };
  cover: string;
  coverAlt?: string;
  tags?: string[];
  author?: {
    name: string;
    avatarUrl?: string;
  };
  date: Date;
  readMinutes?: number;
  featured?: boolean;
  published?: boolean;

  // --- Module 09: Contextual Selling ---
  relatedProducts?: Types.ObjectId[];

  // --- Module 08: AEO/SEO Readiness ---
  metaTitle?: { bn: string; en: string };
  metaDescription?: { bn: string; en: string };
  faqs?: {
    question: { bn: string; en: string };
    answer: { bn: string; en: string };
  }[];
  metaKeywords?: string;
  canonicalUrl?: string;
  socialImage?: string;
  robotsMeta?: {
    noindex?: boolean;
    nofollow?: boolean;
    noarchive?: boolean;
  };
}

const postSchema = new Schema<IPost>(
  {
    slug: { type: String, unique: true, required: true, lowercase: true, index: true },
    title: {
      bn: { type: String, required: true },
      en: { type: String, required: true },
    },
    excerpt: {
      bn: { type: String, required: true },
      en: { type: String, required: true },
    },
    content: {
      bn: String,
      en: String,
    },
    category: {
      bn: { type: String, required: true },
      en: { type: String, required: true },
    },
    cover: { type: String, required: true },
    coverAlt: { type: String, default: '' },
    tags: [{ type: String, lowercase: true }],
    author: {
      name: String,
      avatarUrl: String,
    },
    date: { type: Date, required: true, index: -1 },
    readMinutes: Number,
    featured: { type: Boolean, default: false, index: true },
    published: { type: Boolean, default: true, index: true },

    // --- Module 09: Contextual Selling ---
    relatedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],

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
        if (ret.date) ret.date = ret.date.toISOString();
        delete ret.id;
        return ret;
      },
    },
  },
);

export const PostModel = model<IPost>('Post', postSchema);
