import { IUser } from './auth.interface';

export const formatUser = (user: IUser) => ({
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  createdAt: (user as any).createdAt,
});
