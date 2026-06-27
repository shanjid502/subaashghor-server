import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { uploadBuffer } from '../../utils/cloudinary';

const uploadImage = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Please provide an image file to upload.');
  }

  // Get the target folder or default to general
  const folder = req.body.folder || 'subaashghor/general';

  // Upload file buffer to Cloudinary
  const uploadResult = await uploadBuffer(req.file.buffer, folder);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Image uploaded successfully',
    data: {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
    },
  });
});

export const UploadController = {
  uploadImage,
};
