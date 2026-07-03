import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthService } from './auth.service';
import { UserModel } from './auth.model';

const cookieOptions = {
  httpOnly: true,
  secure: true, // Always true to allow SameSite=None
  sameSite: 'none' as const, // Always 'none' to allow cross-origin sessions in dev/prod
  path: '/',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

const signup = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.signupUser(req.body);
  res.cookie('sg_session', result.accessToken, cookieOptions);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'User registered successfully',
    data: result.user,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);
  res.cookie('sg_session', result.accessToken, cookieOptions);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User logged in successfully',
    data: result.user,
  });
});

const logout = catchAsync(async (_req: Request, res: Response) => {
  res.clearCookie('sg_session', cookieOptions);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Logged out successfully',
    data: { ok: true },
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  // If request has no user property (optional auth), return data: null (as specified: "do not return 401 here, return null")
  if (!req.user) {
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Guest profile',
      data: null,
    });
    return;
  }

  const user = await UserModel.findById(req.user.userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile fetched successfully',
    data: user,
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.forgotPassword(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'If a matching user exists, the reset code or link has been dispatched.',
    data: result,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.resetPassword({
    token: req.body.token,
    phone: req.body.phone,
    code: req.body.code,
    passwordHash: req.body.password,
  });
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Password reset successfully',
    data: result,
  });
});

const requestOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.requestOtp(req.body.phone, req.body.purpose);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'OTP sent to mobile successfully',
    data: result,
  });
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.verifyOtp(req.body.phone, req.body.code, req.body.purpose);
  res.cookie('sg_session', result.accessToken, cookieOptions);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Phone verified and logged in successfully',
    data: result.user,
  });
});

export const AuthControllers = {
  signup,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  requestOtp,
  verifyOtp,
};
