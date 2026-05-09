import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { UserModel } from '../Auth/auth.model';
import { IProfile, IProfileUpdate } from './profile.interface';

const getProfile = async (userId: string): Promise<IProfile> => {
  const user = await UserModel.findById(userId).lean();
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'User not found.');
  return {
    _id: (user._id as any).toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    createdAt: (user as any).createdAt.toISOString(),
  };
};

const updateProfile = async (
  userId: string,
  payload: IProfileUpdate,
): Promise<IProfile> => {
  const user = await UserModel.findByIdAndUpdate(userId, payload, {
    new: true,
  });
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'User not found.');
  return {
    _id: (user._id as any).toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    createdAt: (user as any).createdAt.toISOString(),
  };
};

export const ProfileService = { getProfile, updateProfile };
