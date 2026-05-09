import { Schema, model, Document } from 'mongoose';

export interface IReview extends Document {
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  body: string;
  status: 'pending' | 'published' | 'rejected';
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    productId: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: String,
    body: { type: String, required: true },
    status: { type: String, enum: ['pending', 'published', 'rejected'], default: 'pending' },
  },
  { timestamps: true },
);

reviewSchema.index({ productId: 1, status: 1 });

export const ReviewModel = model<IReview>('Review', reviewSchema);
