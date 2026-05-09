import express, { Request, Response } from 'express';
import { OrderModel } from '../../modules/Order/order.model';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

/**
 * POST /api/public/webhooks/bkash
 *
 * bKash calls this URL after payment. Verify the signature header,
 * match the order, and flip paymentStatus to 'paid'.
 *
 * TODO: Implement proper HMAC-SHA256 signature verification using
 * the bKash webhook secret before going live.
 */
router.post(
  '/bkash',
  catchAsync(async (req: Request, res: Response) => {
    const { orderNumber, transactionId, status } = req.body;

    // TODO: verify bKash HMAC signature
    // const sig = req.headers['x-bkash-signature'];
    // verifyBkashSignature(sig, rawBody, process.env.BKASH_WEBHOOK_SECRET);

    if (status === 'Completed' && orderNumber) {
      await OrderModel.findOneAndUpdate(
        { orderNumber },
        { paymentStatus: 'paid', status: 'confirmed' },
      );
    }

    // Always 200 to bKash
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'OK', data: {} });
  }),
);

export const WebhookRoutes = router;
