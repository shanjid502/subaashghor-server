import { v2 as cloudinary } from 'cloudinary';
import config from '../config';

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name || '',
  api_key: config.cloudinary_api_key || '',
  api_secret: config.cloudinary_api_secret || '',
});

/**
 * Uploads a file buffer directly to a specified Cloudinary folder path
 */
export const uploadBuffer = (
  buffer: Buffer,
  folder: string,
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Cloudinary upload failed'));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      },
    );
    uploadStream.end(buffer);
  });
};
