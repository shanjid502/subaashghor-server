import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthService } from './auth.service';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: AuthService.COOKIE_MAX_AGE,
};

const signup = catchAsync(async (req: Request, res: Response) => {
  const { token, user } = await AuthService.signup(req.body);
  res.cookie(AuthService.COOKIE_NAME, token, COOKIE_OPTIONS);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Account created successfully.',
    data: user,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const { token, user } = await AuthService.login(req.body);
  res.cookie(AuthService.COOKIE_NAME, token, COOKIE_OPTIONS);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Logged in successfully.',
    data: user,
  });
});

const logout = catchAsync(async (_req: Request, res: Response) => {
  res.clearCookie(AuthService.COOKIE_NAME, { path: '/' });
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Logged out successfully.',
    data: { ok: true },
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  // Optional auth — req.user may be undefined
  const userId = req.user?.userId;
  const user = userId ? await AuthService.getMe(userId) : null;
  // Always 200 (null means guest)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: user ? 'User fetched.' : 'Not authenticated.',
    data: user,
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.forgotPassword(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'If that email exists, a reset link has been sent.',
    data: result,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.resetPassword(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Password reset successfully.',
    data: result,
  });
});

export const AuthControllers = {
  signup,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
};
