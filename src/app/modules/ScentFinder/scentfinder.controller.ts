import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ScentFinderService } from './scentfinder.service';

const getAllQuestions = catchAsync(async (_req: Request, res: Response) => {
  const result = await ScentFinderService.getAllQuestions();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Quiz questions fetched successfully',
    data: result,
  });
});

const createQuestion = catchAsync(async (req: Request, res: Response) => {
  const result = await ScentFinderService.createQuestion(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Quiz question created successfully',
    data: result,
  });
});

const deleteQuestion = catchAsync(async (req: Request, res: Response) => {
  const result = await ScentFinderService.deleteQuestion(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Quiz question deleted successfully',
    data: result,
  });
});

export const ScentFinderController = {
  getAllQuestions,
  createQuestion,
  deleteQuestion,
};
