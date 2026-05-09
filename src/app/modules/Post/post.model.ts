import { Schema, model, Document } from 'mongoose';

export interface IPost extends Document {
  slug: string;
  title: { bn: string; en: string };
  excerpt: { bn: string; en: string };
  content?: { bn: string; en: string };
  category: { bn: string; en: string };
  cover: string;
  date: string;
  isPublished: boolean;
}

const bilingualSchema = new Schema({ bn: String, en: String }, { _id: false });

const postSchema = new Schema<IPost>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: bilingualSchema, required: true },
    excerpt: { type: bilingualSchema, required: true },
    content: bilingualSchema,
    category: { type: bilingualSchema, required: true },
    cover: { type: String, required: true },
    date: { type: String, required: true },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const PostModel = model<IPost>('Post', postSchema);
