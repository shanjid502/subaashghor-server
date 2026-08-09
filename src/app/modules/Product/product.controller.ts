import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ProductService } from './product.service';

/** Helper — safely extract the multer file map produced by upload.fields() */
const extractFiles = (req: Request) => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  return {
    featuredImageBuffer: files?.['featuredImage']?.[0]?.buffer ?? null,
    galleryBuffers:      (files?.['galleryImages'] ?? []).map(f => f.buffer),
    socialImageBuffer:  files?.['socialImage']?.[0]?.buffer ?? null,
  };
};

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

const getFeaturedProducts = catchAsync(async (req: Request, res: Response) => {
  const isAdmin = req.query.isAdmin === 'true' || (req as any).user?.role === 'admin';
  const result = await ProductService.getFeaturedProducts(isAdmin);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Featured products fetched successfully',
    data: result,
  });
});

const getProductBySlug = catchAsync(async (req: Request, res: Response) => {
  const isAdmin = req.query.isAdmin === 'true' || (req as any).user?.role === 'admin';
  const result = await ProductService.getProductBySlug(req.params.slug, isAdmin);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product details fetched successfully',
    data: result,
  });
});

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.createProduct(req.body, extractFiles(req));
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Product created successfully',
    data: result,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.updateProduct(req.params.id, req.body, extractFiles(req));
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product updated successfully',
    data: result,
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.deleteProduct(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product deleted successfully',
    data: result,
  });
});

const bulkUpdateProducts = catchAsync(async (req: Request, res: Response) => {
  let csvText = '';
  if (req.file) {
    csvText = req.file.buffer.toString('utf-8');
  } else if (req.body.csv) {
    csvText = req.body.csv;
  } else if (typeof req.body === 'string') {
    csvText = req.body;
  }

  const result = await ProductService.bulkUpdateProducts(csvText);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Products bulk updated successfully',
    data: result,
  });
});

const exportInventoryCSV = catchAsync(async (_req: Request, res: Response) => {
  const csv = await ProductService.exportInventoryCSV();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="inventory-export.csv"');
  res.status(StatusCodes.OK).send(csv);
});

const getFacebookProductFeed = catchAsync(async (_req: Request, res: Response) => {
  const xml = await ProductService.generateFacebookProductFeed();
  res.setHeader('Content-Type', 'application/xml');
  res.status(StatusCodes.OK).send(xml);
});

export const ProductController = {
  getAllProducts,
  getFeaturedProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateProducts,
  exportInventoryCSV,
  getFacebookProductFeed,
};
