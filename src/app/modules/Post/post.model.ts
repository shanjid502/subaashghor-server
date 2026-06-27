import { Schema, model } from 'mongoose';

export interface IPost {
  _id?: string;
  slug: string;
  title: { bn: string; en: string };
  excerpt: { bn: string; en: string };
  content?: { bn: string; en: string };
  category: { bn: string; en: string };
  cover: string;
  tags?: string[];
  author?: {
    name: string;
    avatarUrl?: string;
  };
  date: Date;
  readMinutes?: number;
  featured?: boolean;
  published?: boolean;
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
    tags: [{ type: String, lowercase: true }],
    author: {
      name: String,
      avatarUrl: String,
    },
    date: { type: Date, required: true, index: -1 },
    readMinutes: Number,
    featured: { type: Boolean, default: false, index: true },
    published: { type: Boolean, default: true, index: true },
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
