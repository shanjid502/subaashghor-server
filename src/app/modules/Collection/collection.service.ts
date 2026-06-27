import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { CollectionModel } from './collection.model';
import { ProductModel } from '../Product/product.model';

const getAllCollections = async () => {
  const collections = await CollectionModel.find({ isActive: true }).sort('order');

  // Dynamically calculate productCount for each collection
  const collectionsWithCount = await Promise.all(
    collections.map(async (col) => {
      const productCount = await ProductModel.countDocuments({
        collections: col.slug,
        isActive: true,
      });

      return {
        ...col.toJSON(),
        productCount,
      };
    }),
  );

  return collectionsWithCount;
};

const getCollectionBySlug = async (slug: string) => {
  const collection = await CollectionModel.findOne({ slug, isActive: true });
  if (!collection) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Collection not found');
  }

  const productCount = await ProductModel.countDocuments({
    collections: slug,
    isActive: true,
  });

  return {
    ...collection.toJSON(),
    productCount,
  };
};

export const CollectionService = {
  getAllCollections,
  getCollectionBySlug,
};
