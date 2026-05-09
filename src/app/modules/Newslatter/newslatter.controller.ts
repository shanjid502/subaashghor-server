import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { NewslatterService } from './newslatter.service';

const createNewslatter = catchAsync(async (req: Request, res: Response) => {
  const result = await NewslatterService.createNewslatter(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Newslatter created successfully',
    data: result,
  });
});

const getAllNewslatters = catchAsync(async (req: Request, res: Response) => {
  const result = await NewslatterService.getAllNewslatters(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Newslatters retrieved successfully',
    data: result,
  });
});

const getSingleNewslatter = catchAsync(async (req: Request, res: Response) => {
  const result = await NewslatterService.getSingleNewslatter(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Newslatter retrieved successfully',
    data: result,
  });
});

const updateNewslatter = catchAsync(async (req: Request, res: Response) => {
  const result = await NewslatterService.updateNewslatter(
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Newslatter updated successfully',
    data: result,
  });
});

const deleteNewslatter = catchAsync(async (req: Request, res: Response) => {
  await NewslatterService.deleteNewslatter(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Newslatter deleted successfully',
    data: null,
  });
});

export const NewslatterControllers = {
  createNewslatter,
  getAllNewslatters,
  getSingleNewslatter,
  updateNewslatter,
  deleteNewslatter,
};
