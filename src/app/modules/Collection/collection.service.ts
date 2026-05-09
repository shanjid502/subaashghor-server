import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { CollectionModel } from './collection.model';
import { ProductModel } from '../Product/product.model';

const getAllCollections = async () => {
  const collections = await CollectionModel.find().lean();
  // Attach live product counts
  const withCounts = await Promise.all(
    collections.map(async (c) => ({
      ...c,
      productCount: await ProductModel.countDocuments({ collections: c.slug, isActive: true }),
    })),
  );
  return withCounts;
};

const getCollectionBySlug = async (slug: string) => {
  const collection = await CollectionModel.findOne({ slug }).lean();
  if (!collection) throw new AppError(StatusCodes.NOT_FOUND, 'Collection not found.');
  const productCount = await ProductModel.countDocuments({ collections: slug, isActive: true });
  return { ...collection, productCount };
};

const createCollection = async (payload: unknown) => {
  return CollectionModel.create(payload as object);
};

const updateCollection = async (slug: string, payload: unknown) => {
  const c = await CollectionModel.findOneAndUpdate(
    { slug },
    { $set: payload as Record<string, unknown> },
    { new: true },
  );
  if (!c) throw new AppError(StatusCodes.NOT_FOUND, 'Collection not found.');
  return c;
};

export const CollectionService = {
  getAllCollections,
  getCollectionBySlug,
  createCollection,
  updateCollection,
};
