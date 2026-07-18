import { v2 as cloudinary } from 'cloudinary';
import config from '../config';

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name || '',
  api_key: config.cloudinary_api_key || '',
  api_secret: config.cloudinary_api_secret || '',
});

/**
 * Uploads a file buffer to Cloudinary with automatic WebP/AVIF conversion.
 * Uses `f_auto` and `q_auto` so Cloudinary serves the optimal format per browser.
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
        // Smart quality reduction without visible degradation
        // Note: format is NOT set here — f_auto is injected via optimizeCloudinaryUrl()
        // after upload, which rewrites the delivery URL for browser-optimal format.
        quality: 'auto:good',
        // Enforce a max width of 1600px to prevent massive originals being stored
        transformation: [{ width: 1600, crop: 'limit' }],
      },
      (error, result) => {
        if (error || !result) {
          // Cloudinary returns a plain object, not an Error instance.
          // Wrap it so the global error handler catches it correctly.
          const msg =
            (error as any)?.message ||
            (error as any)?.error?.message ||
            JSON.stringify(error) ||
            'Cloudinary upload failed';
          reject(new Error(`Cloudinary upload failed: ${msg}`));
        } else {
          resolve({
            // 7.1 Inject f_auto,q_auto into the delivery URL so CDN serves WebP/AVIF
            url: optimizeCloudinaryUrl(result.secure_url),
            publicId: result.public_id,
          });
        }
      },
    );
    uploadStream.end(buffer);
  });
};

/**
 * Transforms a standard Cloudinary URL to include f_auto,q_auto delivery params.
 * Works on any existing Cloudinary URL (products migrated from before this change).
 *
 * Input:  https://res.cloudinary.com/rc3ghq9c/image/upload/v123456/subaashghor/products/xyz.jpg
 * Output: https://res.cloudinary.com/rc3ghq9c/image/upload/f_auto,q_auto/v123456/subaashghor/products/xyz.jpg
 */
export const optimizeCloudinaryUrl = (url: string, width?: number): string => {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  const transforms = ['f_auto', 'q_auto'];
  if (width) transforms.push(`w_${width}`);
  return url.replace('/image/upload/', `/image/upload/${transforms.join(',')}/`);
};
