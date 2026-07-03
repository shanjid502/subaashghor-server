import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { RedirectService } from './redirect.service';

const getAllRedirects = catchAsync(async (_req: Request, res: Response) => {
  const result = await RedirectService.getAllRedirects();
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Redirects fetched', data: result });
});

const createRedirect = catchAsync(async (req: Request, res: Response) => {
  const result = await RedirectService.createRedirect(req.body);
  sendResponse(res, { statusCode: StatusCodes.CREATED, success: true, message: 'Redirect created', data: result });
});

const updateRedirect = catchAsync(async (req: Request, res: Response) => {
  const result = await RedirectService.updateRedirect(req.params.id, req.body);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Redirect updated', data: result });
});

const deleteRedirect = catchAsync(async (req: Request, res: Response) => {
  const result = await RedirectService.deleteRedirect(req.params.id);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Redirect deleted', data: result });
});

const resolveRedirect = catchAsync(async (req: Request, res: Response) => {
  const fromPath = req.query.from as string;
  if (!fromPath) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Query parameter "from" is required');
  }
  const result = await RedirectService.resolveRedirect(fromPath);
  if (!result) {
    return sendResponse(res, { statusCode: StatusCodes.NOT_FOUND, success: false, message: 'No redirect found', data: null });
  }
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Redirect resolved', data: result });
});

export const RedirectController = {
  getAllRedirects,
  createRedirect,
  updateRedirect,
  deleteRedirect,
  resolveRedirect,
};
