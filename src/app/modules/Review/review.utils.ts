import { ReviewModel } from './review.model';
import { ProductModel } from '../Product/product.model';

export const updateProductRating = async (productId: string) => {
  const result = await ReviewModel.aggregate([
    { $match: { productId, status: 'approved' } },
    {
      $group: {
        _id: '$productId',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await ProductModel.findByIdAndUpdate(productId, {
      rating: Math.round(result[0].avgRating * 10) / 10,
      reviewCount: result[0].count,
    });
  }
};
