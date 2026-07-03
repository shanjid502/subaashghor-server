import { Types } from 'mongoose';

export interface IReview {
  _id?: string;
  productId: Types.ObjectId;
  productSlug?: string;
  userId: Types.ObjectId;
  userName: string;
  userLocation?: string;
  rating: number;
  title?: string;
  body: string;
  photos?: string[];
  status?: 'pending' | 'published' | 'rejected';
  featured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
