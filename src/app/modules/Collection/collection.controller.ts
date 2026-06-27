import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CollectionService } from './collection.service';

const getAllCollections = catchAsync(async (_req: Request, res: Response) => {
  const result = await CollectionService.getAllCollections();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Collections fetched successfully',
    data: result,
  });
});

const getCollectionBySlug = catchAsync(async (req: Request, res: Response) => {
  const result = await CollectionService.getCollectionBySlug(req.params.slug);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Collection details fetched successfully',
    data: result,
  });
});

export const CollectionController = {
  getAllCollections,
  getCollectionBySlug,
};
