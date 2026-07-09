import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import AppError from '../errors/AppError';
import { verifyToken } from '../utils/jwt.utils';
import config from '../config';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { userId: string; role: string };
    }
  }
}

const auth = (...requiredRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      let token = req.cookies?.sg_session;
      if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        return next(new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!'));
      }

      const decoded = verifyToken(token, config.jwt_access_secret as string);

      const userRole = (decoded.role || '').toLowerCase();
      const roles = requiredRoles.map((r) => r.toLowerCase());

      if (roles.length && !roles.includes(userRole)) {
        return next(
          new AppError(StatusCodes.FORBIDDEN, 'You do not have the required permissions!'),
        );
      }

      req.user = decoded as JwtPayload & { userId: string; role: string };
      next();
    } catch {
      next(new AppError(StatusCodes.UNAUTHORIZED, 'Invalid or expired token!'));
    }
  };
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    let token = req.cookies?.sg_session;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = verifyToken(token, config.jwt_access_secret as string);
      req.user = decoded as JwtPayload & { userId: string; role: string };
    }
  } catch {
    // Ignore invalid/expired token for optional auth
  }
  next();
};

export default auth;
