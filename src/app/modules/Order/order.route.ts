import express from 'express';
import { OrderController } from './order.controller';
import auth, { optionalAuth } from '../../middlewares/auth.middleware';
import validateRequest from '../../utils/validateRequest';
import { OrderValidation } from './order.validation';
import { USER_ROLE } from '../Auth/auth.constant';

const router = express.Router();

router.post(
  '/',
  optionalAuth,
  validateRequest(OrderValidation.createOrderSchema),
  OrderController.createOrder,
);

router.get(
  '/mine',
  auth(USER_ROLE.customer, USER_ROLE.admin),
  OrderController.getMyOrders,
);

// Admin / Management endpoints
router.get('/', auth(USER_ROLE.admin), OrderController.getAllOrders);
router.patch('/:id/status', auth(USER_ROLE.admin), OrderController.updateOrderStatus);
router.delete('/:id', auth(USER_ROLE.admin), OrderController.deleteOrder);

router.get(
  '/:idOrNumber',
  optionalAuth,
  OrderController.getOrderByIdOrNumber,
);

export const OrderRoutes = router;
