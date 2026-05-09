import { Schema, model } from 'mongoose';
import { IWishlist } from './wishlist.interface';

const wishlistSchema = new Schema<IWishlist>({
  userId: { type: String, required: true, unique: true },
  slugs: { type: [String], default: [] },
});

export const WishlistModel = model<IWishlist>('Wishlist', wishlistSchema);
