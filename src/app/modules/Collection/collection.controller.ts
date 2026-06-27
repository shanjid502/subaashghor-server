import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CollectionService } from './collection.service';

const createCollection = catchAsync(async (req: Request, res: Response) => {
  const result = await CollectionService.createCollection(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Collection created successfully',
    data: result,
  });
});

const getAllCollections = catchAsync(async (req: Request, res: Response) => {
  const result = await CollectionService.getAllCollections(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Collections retrieved successfully',
    data: result,
  });
});

const getSingleCollection = catchAsync(async (req: Request, res: Response) => {
  const result = await CollectionService.getSingleCollection(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Collection retrieved successfully',
    data: result,
  });
});

const updateCollection = catchAsync(async (req: Request, res: Response) => {
  const result = await CollectionService.updateCollection(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Collection updated successfully',
    data: result,
  });
});

const deleteCollection = catchAsync(async (req: Request, res: Response) => {
  await CollectionService.deleteCollection(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Collection deleted successfully',
    data: null,
  });
});

export const CollectionControllers = {
  createCollection,
  getAllCollections,
  getSingleCollection,
  updateCollection,
  deleteCollection,
};
