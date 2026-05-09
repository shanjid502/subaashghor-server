import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import config from '../../config';
import { createToken } from '../../utils/jwt.utils';
import { TLoginUser } from './auth.interface';

const loginUser = async (payload: TLoginUser) => {
  // ⚠️  STUB: Replace this with your actual DB lookup + bcrypt.compare()
  // Example for Mongoose:
  //   const user = await UserModel.findOne({ email: payload.email }).select('+password');
  //   if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  //   const isMatch = await bcrypt.compare(payload.password, user.password);
  //   if (!isMatch) throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');

  if (payload.email !== 'admin@test.com' || payload.password !== '123456') {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  const jwtPayload = { userId: 'stub_id_replace_me', role: 'ADMIN' };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return { accessToken, user: jwtPayload };
};

export const AuthService = { loginUser };
