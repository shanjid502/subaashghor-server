import express from 'express';
import { OrderController } from './order.controller';
import auth, { optionalAuth } from '../../middlewares/auth.middleware';
import validateRequest from '../../utils/validateRequest';
import { OrderValidation } from './order.validation';

const router = express.Router();

router.post(
  '/',
  optionalAuth,
  validateRequest(OrderValidation.createOrderSchema),
  OrderController.createOrder,
);

router.get(
  '/mine',
  auth('customer', 'admin'),
  OrderController.getMyOrders,
);

router.get(
  '/:idOrNumber',
  optionalAuth,
  OrderController.getOrderByIdOrNumber,
);

export const OrderRoutes = router;
