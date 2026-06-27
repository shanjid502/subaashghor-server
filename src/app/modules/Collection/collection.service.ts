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
  const collection = await CollectionModel.findOne({ slug });
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

const createCollection = async (payload: any) => {
  if (!payload.slug && payload.name?.en) {
    payload.slug = payload.name.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  const existing = await CollectionModel.findOne({ slug: payload.slug });
  if (existing) {
    throw new AppError(StatusCodes.CONFLICT, 'Collection with this slug already exists');
  }

  const result = await CollectionModel.create(payload);
  return result;
};

const updateCollection = async (id: string, payload: any) => {
  const result = await CollectionModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Collection not found');
  }

  return result;
};

const deleteCollection = async (id: string) => {
  const result = await CollectionModel.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Collection not found');
  }
  return result;
};

export const CollectionService = {
  getAllCollections,
  getCollectionBySlug,
  createCollection,
  updateCollection,
  deleteCollection,
};
