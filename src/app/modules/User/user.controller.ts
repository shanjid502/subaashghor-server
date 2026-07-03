import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserService } from './user.service';

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateProfile(req.user!.userId, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

const getAddresses = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAddresses(req.user!.userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Addresses fetched successfully',
    data: result,
  });
});

const addAddress = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.addAddress(req.user!.userId, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Address added successfully',
    data: result,
  });
});

const updateAddress = catchAsync(async (req: Request, res: Response) => {
  const index = Number(req.params.index);
  const result = await UserService.updateAddress(req.user!.userId, index, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Address updated successfully',
    data: result,
  });
});

const deleteAddress = catchAsync(async (req: Request, res: Response) => {
  const index = Number(req.params.index);
  const result = await UserService.deleteAddress(req.user!.userId, index);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Address deleted successfully',
    data: result,
  });
});

const setDefaultAddress = catchAsync(async (req: Request, res: Response) => {
  const index = Number(req.params.index);
  const result = await UserService.setDefaultAddress(req.user!.userId, index);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Default address updated successfully',
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Users fetched successfully',
    data: result,
  });
});

const createStaffAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createStaffAdmin(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Staff admin created successfully',
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.deleteUser(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

export const UserController = {
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAllUsers,
  createStaffAdmin,
  deleteUser,
};
