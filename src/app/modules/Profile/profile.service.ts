import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { UserModel } from '../Auth/auth.model';

export interface IAddress {
  label?: string;
  name: string;
  phone: string;
  address: string;
  area: string;
  city: string;
  district: string;
  postcode?: string;
  isDefault?: boolean;
}

const getProfile = async (userId: string) => {
  const user = await UserModel.findById(userId).lean();
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'User not found.');
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    createdAt: (user as any).createdAt,
  };
};

const updateProfile = async (
  userId: string,
  payload: { name?: string; phone?: string; avatar?: string },
) => {
  const user = await UserModel.findByIdAndUpdate(userId, payload, { new: true });
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'User not found.');
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    createdAt: (user as any).createdAt,
  };
};

export const ProfileService = { getProfile, updateProfile };
