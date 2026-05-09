import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ProductService } from './product.service';

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await ProductService.getAllProducts(req.query as any);
  res.set('Cache-Control', 'public, max-age=300');
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Products fetched.',
    data,
    meta,
  });
});

const getFeaturedProducts = catchAsync(async (_req: Request, res: Response) => {
  const data = await ProductService.getFeaturedProducts();
  res.set('Cache-Control', 'public, max-age=300');
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Featured products fetched.',
    data,
  });
});

const getProductBySlug = catchAsync(async (req: Request, res: Response) => {
  const data = await ProductService.getProductBySlug(req.params.slug);
  res.set('Cache-Control', 'public, max-age=300');
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product fetched.',
    data,
  });
});

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const data = await ProductService.createProduct(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Product created.',
    data,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const data = await ProductService.updateProduct(req.params.slug, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product updated.',
    data,
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const data = await ProductService.deleteProduct(req.params.slug);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product deactivated.',
    data,
  });
});

export const ProductControllers = {
  getAllProducts,
  getFeaturedProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
