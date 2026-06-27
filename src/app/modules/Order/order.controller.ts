import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { OrderService } from './order.service';

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await OrderService.createOrder(userId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Order created successfully',
    data: result,
  });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getMyOrders(req.user!.userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Orders fetched successfully',
    data: result,
  });
});

const getOrderByIdOrNumber = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getOrderByIdOrNumber(
    req.user,
    req.params.idOrNumber,
    req.query.phone as string | undefined,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Order details fetched successfully',
    data: result,
  });
});

const getAllOrders = catchAsync(async (_req: Request, res: Response) => {
  const result = await OrderService.getAllOrders();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'All orders fetched successfully',
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.updateOrderStatus(req.params.id, req.body.status);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Order status updated successfully',
    data: result,
  });
});

export const OrderController = {
  createOrder,
  getMyOrders,
  getOrderByIdOrNumber,
  getAllOrders,
  updateOrderStatus,
};
