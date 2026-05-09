import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ProfileService } from './profile.service';
import { AddressService } from './address.service';

const getProfile = catchAsync(async (req: Request, res: Response) => {
  const data = await ProfileService.getProfile(req.user.userId);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Profile fetched.', data });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const data = await ProfileService.updateProfile(req.user.userId, req.body);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Profile updated.', data });
});

const updateAvatar = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: 'No file uploaded.',
      data: null,
    });
    return;
  }

  // In a real app, you would upload to Cloudinary/S3 and get a URL
  // Here we use the local path as a stub
  const avatarUrl = `/uploads/${req.file.filename}`;
  const data = await ProfileService.updateProfile(req.user.userId, { avatar: avatarUrl });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Avatar updated successfully.',
    data: { avatar_url: avatarUrl },
  });
});

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

export const ProfileControllers = {
  getProfile,
  updateProfile,
  updateAvatar,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
