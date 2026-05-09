import express from 'express';
import { OrderControllers } from './order.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

// Place order — optional auth (guest checkout allowed)
router.post('/', auth('optional'), OrderControllers.placeOrder);

// GET /orders/mine — must be before /:idOrNumber
router.get('/mine', auth('customer', 'admin'), OrderControllers.getMyOrders);

// GET /orders/:idOrNumber — optional auth; service checks ownership
router.get('/:idOrNumber', auth('optional'), OrderControllers.getOrderByIdOrNumber);

// Admin status update
router.patch('/:orderNumber/status', auth('admin'), OrderControllers.updateOrderStatus);

export const OrderRoutes = router;
