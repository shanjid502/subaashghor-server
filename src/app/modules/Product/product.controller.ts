import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ProductService } from './product.service';

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getAllProducts(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Products fetched successfully',
    data: result.products,
    meta: result.meta,
  });
});

const getFeaturedProducts = catchAsync(async (_req: Request, res: Response) => {
  const result = await ProductService.getFeaturedProducts();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Featured products fetched successfully',
    data: result,
  });
});

const getProductBySlug = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getProductBySlug(req.params.slug);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product details fetched successfully',
    data: result,
  });
});

export const ProductController = {
  getAllProducts,
  getFeaturedProducts,
  getProductBySlug,
};
