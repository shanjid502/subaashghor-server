import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { ProductModel } from './product.model';

const getAllProducts = async (query: Record<string, any>) => {
  const {
    page = 1,
    limit = 100, // Return more products for admin overview
    category,
    collection,
    minPrice,
    maxPrice,
    notes,
    sort = 'newest',
    q,
    isAdmin = false,
  } = query;

  const andConditions: any[] = [];

  // For public client, only show active products
  if (isAdmin !== 'true') {
    andConditions.push({ isActive: true });
  }

  // Category filter
  if (category) {
    andConditions.push({ category });
  }

  // Collection filter
  if (collection) {
    andConditions.push({ collections: collection });
  }

  // Price filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceFilter: Record<string, any> = {};
    if (minPrice !== undefined) priceFilter.$gte = Number(minPrice);
    if (maxPrice !== undefined) priceFilter.$lte = Number(maxPrice);
    andConditions.push({ price: priceFilter });
  }

  // Notes filter
  if (notes) {
    const notesArray = Array.isArray(notes) ? notes : [notes];
    andConditions.push({
      $or: [
        { 'notes.top': { $in: notesArray } },
        { 'notes.heart': { $in: notesArray } },
        { 'notes.base': { $in: notesArray } },
      ],
    });
  }

  // Search filter
  if (q) {
    const escapedQuery = String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    andConditions.push({
      $or: [
        { 'name.en': { $regex: escapedQuery, $options: 'i' } },
        { 'name.bn': { $regex: escapedQuery, $options: 'i' } },
        { 'tagline.en': { $regex: escapedQuery, $options: 'i' } },
        { 'tagline.bn': { $regex: escapedQuery, $options: 'i' } },
      ],
    });
  }

  const filterObj = andConditions.length > 0 ? { $and: andConditions } : {};

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
  const product = await ProductModel.findOne({ slug });
  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  }
  return product;
};

const createProduct = async (payload: any) => {
  // If slug is not provided, generate from English name
  if (!payload.slug && payload.name?.en) {
    payload.slug = payload.name.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  const existingProduct = await ProductModel.findOne({ slug: payload.slug });
  if (existingProduct) {
    throw new AppError(StatusCodes.CONFLICT, 'Product with this slug already exists');
  }

  const result = await ProductModel.create(payload);
  return result;
};

const updateProduct = async (id: string, payload: any) => {
  const result = await ProductModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  return result;
};

const deleteProduct = async (id: string) => {
  const result = await ProductModel.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  }
  return result;
};

export const ProductService = {
  getAllProducts,
  getFeaturedProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
