import { Schema, model, Types } from 'mongoose';

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

const reviewSchema = new Schema<IReview>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    productSlug: { type: String, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true },
    userLocation: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 120 },
    body: { type: String, required: true, maxlength: 1500 },
    photos: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'published', 'rejected'],
      default: 'pending',
      index: true,
    },
    featured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret: any) => {
        ret._id = String(ret._id);
        ret.productId = String(ret.productId);
        ret.userId = String(ret.userId);
        delete ret.id;
        return ret;
      },
    },
  },
);

// Prevent duplicate reviews per user/product
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export const ReviewModel = model<IReview>('Review', reviewSchema);
