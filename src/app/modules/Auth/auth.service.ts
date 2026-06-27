import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import config from '../../config';
import { createToken, verifyToken } from '../../utils/jwt.utils';
import { TLoginUser, TSignupUser } from './auth.interface';
import { UserModel, OtpTokenModel } from './auth.model';
import bcrypt from 'bcrypt';

const signupUser = async (payload: TSignupUser) => {
  const existingUser = await UserModel.findOne({ email: payload.email });
  if (existingUser) {
    throw new AppError(StatusCodes.CONFLICT, 'Email already registered.');
  }

  const newUser = await UserModel.create({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    passwordHash: payload.password, // Schema hook hashes this
    role: 'customer',
  });

  const jwtPayload = {
    userId: String(newUser._id),
    role: newUser.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    accessToken,
    user: newUser,
  };
};

const loginUser = async (payload: TLoginUser) => {
  const user = await UserModel.findOne({ email: payload.email }).select('+passwordHash');
  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Incorrect email or password.');
  }

  const isPasswordMatch = await user.comparePassword(payload.password);
  if (!isPasswordMatch) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Incorrect email or password.');
  }

  const jwtPayload = {
    userId: String(user._id),
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    accessToken,
    user,
  };
};

const forgotPassword = async (email: string) => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    // Return success to prevent email enumeration
    return { ok: true };
  }

  // Generate a short reset token valid for 15m
  const resetToken = createToken(
    { userId: String(user._id), role: user.role },
    config.password_reset_secret as string,
    config.password_reset_secret_expires_in as string,
  );

  // In development, log the reset token link
  console.log(`🔑 PASSWORD RESET LINK: http://localhost:5173/reset-password?token=${resetToken}`);

  return { ok: true };
};

const resetPassword = async (payload: { token: string; passwordHash: string }) => {
  try {
    const decoded = verifyToken(payload.token, config.password_reset_secret as string);
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }

    user.passwordHash = payload.passwordHash; // Schema pre-save hook will hash
    await user.save();

    return { ok: true };
  } catch (error) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid or expired reset token');
  }
};

const requestOtp = async (phone: string) => {
  const code = '1234'; // Standard mock OTP for local/testing
  const codeHash = await bcrypt.hash(code, 8);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes TTL

  await OtpTokenModel.create({
    phone,
    codeHash,
    purpose: 'login',
    expiresAt,
  });

  console.log(`📱 SENT SMS OTP to ${phone}: Code is ${code}`);

  return {
    sent: true,
    expiresInSec: 300,
    resendInSec: 60,
  };
};

const verifyOtp = async (phone: string, code: string) => {
  const token = await OtpTokenModel.findOne({
    phone,
    consumedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!token) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid or expired OTP');
  }

  token.attempts += 1;
  await token.save();

  if (token.attempts > 5) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Too many invalid attempts');
  }

  const isMatch = await bcrypt.compare(code, token.codeHash);
  if (!isMatch) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Incorrect OTP code');
  }

  token.consumedAt = new Date();
  await token.save();

  // Find or create the user by phone
  let user = await UserModel.findOne({ phone });
  if (!user) {
    user = await UserModel.create({
      name: `User ${phone.slice(-4)}`,
      phone,
      email: `${phone.replace('+', '')}@subaashghor.mock`, // Dummy email
      role: 'customer',
      phoneVerified: true,
    });
  }

  const jwtPayload = {
    userId: String(user._id),
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    accessToken,
    user,
  };
};

export const AuthService = {
  signupUser,
  loginUser,
  forgotPassword,
  resetPassword,
  requestOtp,
  verifyOtp,
};
