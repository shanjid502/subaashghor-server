import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { ProductModel } from './product.model';

interface ProductQuery {
  page?: string | number;
  limit?: string | number;
  category?: string;
  collection?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  notes?: string | string[];
  sort?: string;
  q?: string;
}

const getAllProducts = async (query: ProductQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 12;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { isActive: true };

  if (query.category) filter.category = query.category;
  if (query.collection) filter.collections = query.collection;
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) (filter.price as Record<string, unknown>).$gte = Number(query.minPrice);
    if (query.maxPrice) (filter.price as Record<string, unknown>).$lte = Number(query.maxPrice);
  }
  if (query.notes) {
    const notesArr = Array.isArray(query.notes) ? query.notes : [query.notes];
    filter.$or = [
      { 'notes.top': { $in: notesArr } },
      { 'notes.heart': { $in: notesArr } },
      { 'notes.base': { $in: notesArr } },
    ];
  }
  if (query.q) {
    filter.$text = { $search: query.q };
  }

  const sortMap: Record<string, string> = {
    newest: '-createdAt',
    'price-asc': 'price',
    'price-desc': '-price',
    popular: '-reviewCount -rating',
  };
  const sortStr = sortMap[query.sort as string] ?? sortMap.newest;

  const [products, total] = await Promise.all([
    ProductModel.find(filter).sort(sortStr).skip(skip).limit(limit).lean(),
    ProductModel.countDocuments(filter),
  ]);

  return {
    data: products,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getFeaturedProducts = async () => {
  const products = await ProductModel.find({ isActive: true })
    .sort({ reviewCount: -1, rating: -1, createdAt: -1 })
    .limit(8)
    .lean();
  return products;
};

const getProductBySlug = async (slug: string) => {
  const product = await ProductModel.findOne({ slug, isActive: true }).lean();
  if (!product) throw new AppError(StatusCodes.NOT_FOUND, 'Product not found.');
  return product;
};

const createProduct = async (payload: unknown) => {
  const product = await ProductModel.create(payload as object);
  return product;
};

const updateProduct = async (slug: string, payload: unknown) => {
  const product = await ProductModel.findOneAndUpdate({ slug } as object, payload as object, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new AppError(StatusCodes.NOT_FOUND, 'Product not found.');
  return product;
};

const deleteProduct = async (slug: string) => {
  await ProductModel.findOneAndUpdate({ slug }, { isActive: false });
  return { ok: true };
};

export const ProductService = {
  getAllProducts,
  getFeaturedProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
