import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { NewslatterService } from './newslatter.service';

const subscribe = catchAsync(async (req: Request, res: Response) => {
  const result = await NewslatterService.subscribe(req.body.email);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscribed to newsletter successfully',
    data: result,
  });
});

export const NewslatterController = {
  subscribe,
};
