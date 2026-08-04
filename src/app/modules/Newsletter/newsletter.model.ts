import { Schema, model } from 'mongoose';
import { INewsletter } from './newsletter.interface';

const newsletterSchema = new Schema<INewsletter>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export const NewsletterModel = model<INewsletter>('Newsletter', newsletterSchema);
