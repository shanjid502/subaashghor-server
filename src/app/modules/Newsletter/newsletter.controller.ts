import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { NewsletterService } from './newsletter.service';

const subscribe = catchAsync(async (req: Request, res: Response) => {
  const data = await NewsletterService.subscribe(req.body.email);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscribed successfully.',
    data,
  });
});

const captureLead = catchAsync(async (req: Request, res: Response) => {
  const data = await NewsletterService.captureLead(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Lead captured.',
    data,
  });
});

export const NewsletterControllers = { subscribe, captureLead };
