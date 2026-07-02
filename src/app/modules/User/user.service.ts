import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { UserModel, IAddress } from '../Auth/auth.model';

const updateProfile = async (userId: string, payload: { name?: string; avatarUrl?: string }) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (payload.name) user.name = payload.name;
  if (payload.avatarUrl) user.avatarUrl = payload.avatarUrl;

  await user.save();
  return user;
};

const getAddresses = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }
  return user.addresses || [];
};

const addAddress = async (userId: string, address: IAddress) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (address.isDefault) {
    // Unset other defaults
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  } else if (user.addresses.length === 0) {
    address.isDefault = true;
  }

  user.addresses.push(address);
  await user.save();
  return user.addresses[user.addresses.length - 1];
};

const updateAddress = async (userId: string, index: number, address: IAddress) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (index < 0 || index >= user.addresses.length) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid address index');
  }

  if (address.isDefault) {
    // Unset other defaults
    user.addresses.forEach((addr, i) => {
      if (i !== index) addr.isDefault = false;
    });
  }

  user.addresses[index] = {
    ...user.addresses[index],
    ...address,
  };

  await user.save();
  return user.addresses[index];
};

const deleteAddress = async (userId: string, index: number) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (index < 0 || index >= user.addresses.length) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid address index');
  }

  const wasDefault = user.addresses[index].isDefault;
  user.addresses.splice(index, 1);

  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  return { ok: true };
};

const setDefaultAddress = async (userId: string, index: number) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (index < 0 || index >= user.addresses.length) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid address index');
  }

  user.addresses.forEach((addr, i) => {
    addr.isDefault = i === index;
  });

  await user.save();
  return user.addresses;
};

const getAllUsers = async (query: Record<string, any>) => {
  const role = query.role || 'customer';
  const users = await UserModel.aggregate([
    {
      $match: { role },
    },
    {
      $lookup: {
        from: 'orders',
        localField: '_id',
        foreignField: 'userId',
        as: 'userOrders',
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        phone: 1,
        role: 1,
        avatarUrl: 1,
        createdAt: 1,
        orders: { $size: '$userOrders' },
        spent: {
          $sum: {
            $map: {
              input: '$userOrders',
              as: 'order',
              in: {
                $cond: [
                  { $ne: ['$$order.status', 'cancelled'] },
                  '$$order.total',
                  0,
                ],
              },
            },
          },
        },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  return users.map((u) => ({
    id: String(u._id),
    _id: String(u._id),
    name: u.name,
    email: u.email || 'no-email@subaashghor.com',
    phone: u.phone,
    orders: u.orders,
    spent: u.spent,
    joined: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : 'N/A',
  }));
};

export const UserService = {
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAllUsers,
};
