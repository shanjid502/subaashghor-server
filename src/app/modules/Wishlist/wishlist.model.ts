import { Schema, model, Document } from 'mongoose';

export interface IWishlist extends Document {
  userId: string;
  slugs: string[];
}

const wishlistSchema = new Schema<IWishlist>({
  userId: { type: String, required: true, unique: true },
  slugs: { type: [String], default: [] },
});

export const WishlistModel = model<IWishlist>('Wishlist', wishlistSchema);
