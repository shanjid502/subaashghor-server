import { Document } from 'mongoose';

export interface IReview extends Document {
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}
