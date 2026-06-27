import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { ProductModel } from './product.model';

const getAllProducts = async (query: Record<string, any>) => {
  const {
    page = 1,
    limit = 12,
    category,
    collection,
    minPrice,
    maxPrice,
    notes,
    sort = 'newest',
    q,
  } = query;

  const filterObj: Record<string, any> = { isActive: true };

  // Category filter
  if (category) {
    filterObj.category = category;
  }

  // Collection filter
  if (collection) {
    filterObj.collections = collection;
  }

  // Price filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    filterObj.price = {};
    if (minPrice !== undefined) filterObj.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filterObj.price.$lte = Number(maxPrice);
  }

  // Notes filter
  if (notes) {
    const notesArray = Array.isArray(notes) ? notes : [notes];
    filterObj.$or = [
      { 'notes.top': { $in: notesArray } },
      { 'notes.heart': { $in: notesArray } },
      { 'notes.base': { $in: notesArray } },
    ];
  }

  // Search filter
  if (q) {
    filterObj.$or = filterObj.$or || [];
    filterObj.$or.push(
      { 'name.en': { $regex: q, $options: 'i' } },
      { 'name.bn': { $regex: q, $options: 'i' } },
      { 'tagline.en': { $regex: q, $options: 'i' } },
      { 'tagline.bn': { $regex: q, $options: 'i' } },
    );
  }

  // Sort order mapping
  let sortStr = '-createdAt';
  if (sort === 'price-asc') sortStr = 'price';
  else if (sort === 'price-desc') sortStr = '-price';
  else if (sort === 'popular') sortStr = '-rating';

  const skip = (Number(page) - 1) * Number(limit);

  const productsQuery = ProductModel.find(filterObj)
    .sort(sortStr)
    .skip(skip)
    .limit(Number(limit));

  const products = await productsQuery;
  const total = await ProductModel.countDocuments(filterObj);

  return {
    products,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

const getFeaturedProducts = async () => {
  const featured = await ProductModel.find({ isActive: true }).limit(8);
  return featured;
};

const getProductBySlug = async (slug: string) => {
  const product = await ProductModel.findOne({ slug, isActive: true });
  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  }
  return product;
};

export const ProductService = {
  getAllProducts,
  getFeaturedProducts,
  getProductBySlug,
};
