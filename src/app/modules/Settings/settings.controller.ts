import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SettingsService } from './settings.service';
import { ProductService } from '../Product/product.service';

const getSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await SettingsService.getSettings();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Settings fetched successfully',
    data: result,
  });
});

const updateSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await SettingsService.updateSettings(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Settings updated successfully',
    data: result,
  });
});

const clearCache = catchAsync(async (req: Request, res: Response) => {
  await ProductService.clearCache();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Caches successfully cleared on the server',
    data: null,
  });
});

export const SettingsController = {
  getSettings,
  updateSettings,
  clearCache,
};
