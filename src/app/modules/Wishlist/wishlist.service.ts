import { WishlistModel } from './wishlist.model';

const getWishlist = async (userId: string): Promise<string[]> => {
  const wishlist = await WishlistModel.findOne({ userId });
  return wishlist?.slugs ?? [];
};

const addToWishlist = async (userId: string, slug: string): Promise<string[]> => {
  const wishlist = await WishlistModel.findOneAndUpdate(
    { userId },
    { $addToSet: { slugs: slug } },
    { upsert: true, new: true },
  );
  return wishlist.slugs;
};

const removeFromWishlist = async (userId: string, slug: string): Promise<string[]> => {
  const wishlist = await WishlistModel.findOneAndUpdate(
    { userId },
    { $pull: { slugs: slug } },
    { new: true },
  );
  return wishlist?.slugs ?? [];
};

export const WishlistService = { getWishlist, addToWishlist, removeFromWishlist };
