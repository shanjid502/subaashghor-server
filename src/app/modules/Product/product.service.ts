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

  const filterObj: Record<string, any> = {};

  // For public client, only show active products
  if (!isAdmin) {
    filterObj.isActive = true;
  }

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
  if (payload.name?.en && !payload.slug) {
    payload.slug = payload.name.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

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
