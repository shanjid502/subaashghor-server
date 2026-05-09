import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AddressService } from './address.service';

const getAddresses = catchAsync(async (req: Request, res: Response) => {
  const data = await AddressService.getAddresses(req.user.userId);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Addresses fetched.', data });
});

const addAddress = catchAsync(async (req: Request, res: Response) => {
  const data = await AddressService.addAddress(req.user.userId, req.body);
  sendResponse(res, { statusCode: StatusCodes.CREATED, success: true, message: 'Address added.', data });
});

const updateAddress = catchAsync(async (req: Request, res: Response) => {
  const data = await AddressService.updateAddress(req.user.userId, req.params.id, req.body);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Address updated.', data });
});

const deleteAddress = catchAsync(async (req: Request, res: Response) => {
  const data = await AddressService.deleteAddress(req.user.userId, req.params.id);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Address deleted.', data });
});

const setDefaultAddress = catchAsync(async (req: Request, res: Response) => {
  const data = await AddressService.setDefaultAddress(req.user.userId, req.params.id);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Default address set.', data });
});

export const AddressControllers = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
