import { Schema, model } from 'mongoose';
import { IPost } from './post.interface';

const bilingualSchema = new Schema(
  {
    en: { type: String, required: true },
    bn: { type: String, required: true },
  },
  { _id: false },
);

const postSchema = new Schema<IPost>(
  {
    title: { type: bilingualSchema, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: bilingualSchema, required: true },
    image: String,
    author: { type: String, default: 'Admin' },
    tags: { type: [String], default: [] },
    isPublished: { type: Boolean, default: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const PostModel = model<IPost>('Post', postSchema);
