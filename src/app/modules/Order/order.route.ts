import express from 'express';
import { OrderControllers } from './order.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

// Place order — optional auth (guest checkout allowed)
/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Place an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order placed successfully
 */
router.post('/', auth('optional'), OrderControllers.placeOrder);

/**
 * @swagger
 * /orders/mine:
 *   get:
 *     summary: Get my orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 */
router.get('/mine', auth('customer', 'admin'), OrderControllers.getMyOrders);

/**
 * @swagger
 * /orders/{idOrNumber}:
 *   get:
 *     summary: Get order by ID or Order Number
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idOrNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 */
router.get(
  '/:idOrNumber',
  auth('optional'),
  OrderControllers.getOrderByIdOrNumber,
);

/**
 * @swagger
 * /orders/{orderNumber}/status:
 *   patch:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.patch(
  '/:orderNumber/status',
  auth('admin'),
  OrderControllers.updateOrderStatus,
);

export const OrderRoutes = router;
