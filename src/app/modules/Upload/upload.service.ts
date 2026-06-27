import { uploadBuffer } from '../../utils/cloudinary';

const uploadImage = async (fileBuffer: Buffer, folder: string) => {
  const result = await uploadBuffer(fileBuffer, folder);
  return result;
};

export const UploadService = {
  uploadImage,
};
