import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import config from '../../config';
import { createToken } from '../../utils/jwt.utils';
import { sendEmail, passwordResetEmail } from '../../utils/email.utils';
import { UserModel } from './auth.model';
import { ISignup, ILogin, IForgotPassword, IResetPassword } from './auth.interface';
import { formatUser } from './auth.utils';

const COOKIE_NAME = 'sg_session';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

const signup = async (payload: ISignup) => {
  const existing = await UserModel.findOne({ email: payload.email.toLowerCase() });
  if (existing) {
    throw new AppError(StatusCodes.CONFLICT, 'Email already registered.');
  }

  const user = await UserModel.create({
    name: payload.name,
    email: payload.email.toLowerCase(),
    password: payload.password,
    phone: payload.phone,
  });

  const accessToken = createToken(
    { userId: user._id.toString(), role: user.role },
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );

  return { token: accessToken, user: formatUser(user as any) };
};

const login = async (payload: ILogin) => {
  const user = await UserModel.findOne({ email: payload.email.toLowerCase() }).select('+password');
  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Incorrect email or password.');
  }

  const isMatch = await bcrypt.compare(payload.password, user.password);
  if (!isMatch) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Incorrect email or password.');
  }

  const accessToken = createToken(
    { userId: user._id.toString(), role: user.role },
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );

  return { token: accessToken, user: formatUser(user as any) };
};

const getMe = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) return null;
  return formatUser(user as any);
};

const forgotPassword = async (payload: IForgotPassword) => {
  const user = await UserModel.findOne({ email: payload.email.toLowerCase() }).select(
    '+passwordResetToken +passwordResetExpires',
  );

  // Anti-enumeration: always return ok
  if (!user) return { ok: true };

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.passwordResetToken = hashed;
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${config.client_url}/reset-password?token=${rawToken}`;
  const { subject, html } = passwordResetEmail(resetUrl);

  await sendEmail({ to: user.email, subject, html });

  return { ok: true };
};

const resetPassword = async (payload: IResetPassword) => {
  const hashed = crypto.createHash('sha256').update(payload.token).digest('hex');

  const user = await UserModel.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid or expired reset token.');
  }

  user.password = payload.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return { ok: true };
};

export const AuthService = {
  signup,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  COOKIE_NAME,
  COOKIE_MAX_AGE,
};
