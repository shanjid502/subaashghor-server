import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CollectionService } from './collection.service';

const getAllCollections = catchAsync(async (_req: Request, res: Response) => {
  const data = await CollectionService.getAllCollections();
  res.set('Cache-Control', 'public, max-age=300');
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Collections fetched.',
    data,
  });
});

const getCollectionBySlug = catchAsync(async (req: Request, res: Response) => {
  const data = await CollectionService.getCollectionBySlug(req.params.slug);
  res.set('Cache-Control', 'public, max-age=300');
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Collection fetched.',
    data,
  });
});

const createCollection = catchAsync(async (req: Request, res: Response) => {
  const data = await CollectionService.createCollection(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Collection created.',
    data,
  });
});

const updateCollection = catchAsync(async (req: Request, res: Response) => {
  const data = await CollectionService.updateCollection(
    req.params.slug,
    req.body,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Collection updated.',
    data,
  });
});

export const CollectionControllers = {
  getAllCollections,
  getCollectionBySlug,
  createCollection,
  updateCollection,
};
