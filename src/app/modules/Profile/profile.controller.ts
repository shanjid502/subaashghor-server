import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ProfileService } from './profile.service';

const getProfile = catchAsync(async (req: Request, res: Response) => {
  const data = await ProfileService.getProfile(req.user.userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile fetched.',
    data,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const data = await ProfileService.updateProfile(req.user.userId, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile updated.',
    data,
  });
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

  // Cloudinary returns the secure_url in req.file.path when using multer-storage-cloudinary
  const avatarUrl = (req.file as any).path;
  await ProfileService.updateProfile(req.user.userId, { avatar: avatarUrl });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Avatar updated successfully.',
    data: { avatar_url: avatarUrl },
  });
});

export const ProfileControllers = {
  getProfile,
  updateProfile,
  updateAvatar,
};
