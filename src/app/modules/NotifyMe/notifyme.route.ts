import express from 'express';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { NotifyMeService } from './notifyme.service';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

router.post(
  '/',
  catchAsync(async (req, res) => {
    const data = await NotifyMeService.subscribe(req.body);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'You will be notified.',
      data,
    });
  }),
);

export const NotifyMeRoutes = router;
