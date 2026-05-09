import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { OrderService } from './order.service';

const placeOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId; // optional — guest checkout allowed
  const data = await OrderService.placeOrder({ ...req.body, userId });
  sendResponse(res, { statusCode: StatusCodes.CREATED, success: true, message: 'Order placed successfully.', data });
});

const getOrderByIdOrNumber = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const data = await OrderService.getOrderByIdOrNumber(req.params.idOrNumber, userId);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Order fetched.', data });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const data = await OrderService.getMyOrders(userId);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Orders fetched.', data });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const data = await OrderService.updateOrderStatus(req.params.orderNumber, req.body);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Order updated.', data });
});

export const OrderControllers = { placeOrder, getOrderByIdOrNumber, getMyOrders, updateOrderStatus };
