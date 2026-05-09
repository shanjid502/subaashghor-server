import express from 'express';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SiteConfigModel } from './siteConfig.model';
import auth from '../../middlewares/auth';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

// Build config object from all key-value pairs
router.get(
  '/',
  catchAsync(async (_req, res) => {
    const entries = await SiteConfigModel.find().lean();
    const data = entries.reduce<Record<string, unknown>>((acc, entry) => {
      acc[entry.key] = entry.value;
      return acc;
    }, {});
    res.set('Cache-Control', 'public, max-age=60');
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Site config fetched.', data });
  }),
);

// Admin: upsert individual keys
router.patch(
  '/',
  auth('admin'),
  catchAsync(async (req, res) => {
    const updates = Object.entries(req.body as Record<string, unknown>);
    await Promise.all(
      updates.map(([key, value]) =>
        SiteConfigModel.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true }),
      ),
    );
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Site config updated.', data: {} });
  }),
);

export const SiteConfigRoutes = router;
