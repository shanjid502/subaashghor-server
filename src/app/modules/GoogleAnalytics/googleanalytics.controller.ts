import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { GoogleAnalyticsService } from './googleanalytics.service';

// ─── GA4 ──────────────────────────────────────────────────────────────────────

const getGA4Overview = catchAsync(async (req: Request, res: Response) => {
  const dateRange = (req.query.range as '7d' | '28d' | '90d') || '28d';
  const result = await GoogleAnalyticsService.getGA4Overview(dateRange);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'GA4 overview fetched', data: result });
});

const getGA4TopPages = catchAsync(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await GoogleAnalyticsService.getGA4TopPages(limit);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'GA4 top pages fetched', data: result });
});

// ─── Search Console ───────────────────────────────────────────────────────────

const getGSCOverview = catchAsync(async (req: Request, res: Response) => {
  const dateRange = (req.query.range as '7d' | '28d' | '90d') || '28d';
  const result = await GoogleAnalyticsService.getGSCOverview(dateRange);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'GSC overview fetched', data: result });
});

const getGSCTopQueries = catchAsync(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await GoogleAnalyticsService.getGSCTopQueries(limit);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'GSC top queries fetched', data: result });
});

const getGSCTopPages = catchAsync(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await GoogleAnalyticsService.getGSCTopPages(limit);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'GSC top pages fetched', data: result });
});

// ─── Indexing API ─────────────────────────────────────────────────────────────

const requestInstantIndex = catchAsync(async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url) throw new AppError(StatusCodes.BAD_REQUEST, '"url" is required');
  const result = await GoogleAnalyticsService.requestInstantIndex(url);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Indexing request sent', data: result });
});

export const GoogleAnalyticsController = {
  getGA4Overview,
  getGA4TopPages,
  getGSCOverview,
  getGSCTopQueries,
  getGSCTopPages,
  requestInstantIndex,
};
