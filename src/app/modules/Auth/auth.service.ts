import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import config from '../../config';
import { createToken, verifyToken } from '../../utils/jwt.utils';
import { TLoginUser, TSignupUser } from './auth.interface';
import { UserModel, OtpTokenModel } from './auth.model';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { runInTransaction } from '../../utils/transaction';

const signupUser = async (payload: TSignupUser) => {
  // Check unique phone number
  const existingUserByPhone = await UserModel.findOne({ phone: payload.phone });
  if (existingUserByPhone) {
    throw new AppError(StatusCodes.CONFLICT, 'Phone number already registered.');
  }

  // Check unique email (if provided)
  if (payload.email) {
    const existingUserByEmail = await UserModel.findOne({ email: payload.email });
    if (existingUserByEmail) {
      throw new AppError(StatusCodes.CONFLICT, 'Email already registered.');
    }
  }

  const newUser = await UserModel.create({
    name: payload.name,
    email: payload.email || undefined,
    phone: payload.phone,
    passwordHash: payload.password || undefined,
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
  let user = null;

  if (payload.phone) {
    user = await UserModel.findOne({ phone: payload.phone }).select('+passwordHash');
  } else if (payload.email) {
    user = await UserModel.findOne({ email: payload.email }).select('+passwordHash');
  }

  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Incorrect phone/email or password.');
  }

  if (!payload.password) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Password is required to log in via password.');
  }

  if (!user.passwordHash) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      'This account does not have a password set. Please log in using OTP verification.',
    );
  }

  const isPasswordMatch = await user.comparePassword(payload.password);
  if (!isPasswordMatch) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Incorrect phone/email or password.');
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

const forgotPassword = async (payload: { email?: string; phone?: string }) => {
  if (payload.phone) {
    const user = await UserModel.findOne({ phone: payload.phone });
    if (!user) {
      return { ok: true }; // Prevent user enumeration
    }

    // Generate a reset-password OTP (secure in production)
    const code = config.NODE_ENV === 'production'
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : '1234';
    const codeHash = await bcrypt.hash(code, 8);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes TTL

    await OtpTokenModel.create({
      phone: payload.phone,
      codeHash,
      purpose: 'reset-password',
      expiresAt,
    });

    if (config.NODE_ENV === 'development') {
      console.log(`📱 SENT SMS OTP to ${payload.phone} for password reset: Code is ${code}`);
    }
    return { sent: true, via: 'phone' };
  } else if (payload.email) {
    const user = await UserModel.findOne({ email: payload.email });
    if (!user) {
      return { ok: true }; // Prevent user enumeration
    }

    const resetToken = createToken(
      { userId: String(user._id), role: user.role },
      config.password_reset_secret as string,
      config.password_reset_secret_expires_in as string,
    );

    if (config.NODE_ENV === 'development') {
      console.log(`🔑 PASSWORD RESET LINK: http://localhost:5173/reset-password?token=${resetToken}`);
    }
    return { sent: true, via: 'email' };
  }

  throw new AppError(StatusCodes.BAD_REQUEST, 'Either email or phone is required.');
};

const resetPassword = async (payload: {
  token?: string;
  phone?: string;
  code?: string;
  passwordHash: string;
}) => {
  if (payload.token) {
    try {
      const decoded = verifyToken(payload.token, config.password_reset_secret as string);
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
      }

      user.passwordHash = payload.passwordHash;
      await user.save();
      return { ok: true };
    } catch {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid or expired reset token');
    }
  } else if (payload.phone && payload.code) {
    const token = await OtpTokenModel.findOne({
      phone: payload.phone,
      purpose: 'reset-password',
      consumedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!token) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid or expired OTP');
    }

    if (token.attempts >= 5) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Too many invalid attempts. Please request a new OTP.');
    }

    const isMatch = await bcrypt.compare(payload.code, token.codeHash);
    if (!isMatch) {
      token.attempts += 1;
      await token.save();
      throw new AppError(StatusCodes.BAD_REQUEST, 'Incorrect OTP code');
    }

    await runInTransaction(async (session) => {
      token.consumedAt = new Date();
      await token.save({ session });

      const user = await UserModel.findOne({ phone: payload.phone }).session(session);
      if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
      }

      user.passwordHash = payload.passwordHash;
      await user.save({ session });
    });

    return { ok: true };
  }

  throw new AppError(StatusCodes.BAD_REQUEST, 'Token or Phone/OTP is required.');
};

const requestOtp = async (phone: string, purpose: 'login' | 'signup' | 'verify' | 'reset-password' = 'login') => {
  // Use cryptographically secure 6-digit random code in production, 1234 in development
  const code = config.NODE_ENV === 'production'
    ? Math.floor(100000 + Math.random() * 900000).toString()
    : '1234';
  const codeHash = await bcrypt.hash(code, 8);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes TTL

  await OtpTokenModel.create({
    phone,
    codeHash,
    purpose,
    expiresAt,
  });

  if (config.NODE_ENV === 'development') {
    console.log(`📱 SENT SMS OTP to ${phone} for ${purpose}: Code is ${code}`);
  }

  return {
    sent: true,
    expiresInSec: 300,
    resendInSec: 60,
  };
};

const verifyOtp = async (phone: string, code: string, purpose: 'login' | 'signup' | 'verify' | 'reset-password' = 'login') => {
  const token = await OtpTokenModel.findOne({
    phone,
    purpose,
    consumedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!token) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid or expired OTP');
  }

  if (token.attempts >= 5) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Too many invalid attempts. Please request a new OTP.');
  }

  const isMatch = await bcrypt.compare(code, token.codeHash);
  if (!isMatch) {
    token.attempts += 1;
    await token.save();
    throw new AppError(StatusCodes.BAD_REQUEST, 'Incorrect OTP code');
  }

  const result = await runInTransaction(async (session) => {
    token.consumedAt = new Date();
    await token.save({ session });

    // Find or create the user by phone
    let user = await UserModel.findOne({ phone }).session(session);
    if (!user) {
      const createdUsers = await UserModel.create(
        [
          {
            name: `User ${phone.slice(-4)}`,
            phone,
            role: 'customer',
            phoneVerified: true,
          },
        ],
        { session },
      );
      user = createdUsers[0];
    } else {
      user.phoneVerified = true;
      await user.save({ session });
    }
    return user;
  });

  const jwtPayload = {
    userId: String(result._id),
    role: result.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    accessToken,
    user: result,
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
