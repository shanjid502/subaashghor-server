import { IProduct } from './product.interface';

const createProduct = async (payload: IProduct) => {
  // TODO: Implement create logic
  return payload;
};

const getAllProducts = async (query: Record<string, unknown>) => {
  // TODO: Implement list logic (with filtering, sorting, pagination)
  return [];
};

const getSingleProduct = async (id: string) => {
  // TODO: Implement find-by-id logic
  return null;
};

const updateProduct = async (id: string, payload: Partial<IProduct>) => {
  // TODO: Implement update logic
  return null;
};

const deleteProduct = async (id: string) => {
  // TODO: Implement delete logic
  return null;
};

export const ProductService = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
