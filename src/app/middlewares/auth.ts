import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import AppError from '../errors/AppError';
import { verifyToken } from '../utils/jwt.utils';
import config from '../config';

// Extend Express Request so req.user is fully typed downstream
declare global {
  namespace Express {
    interface Request {
      user: JwtPayload & { userId: string; role: string };
    }
  }
}

/**
 * Cookie-based auth guard.
 * Reads `sg_session` httpOnly cookie.
 * Pass requiredRoles to restrict access; pass none to allow any authenticated user.
 * Pass `optional: true` as the last argument string to skip 401 for unauthenticated requests
 * (req.user will be undefined in that case).
 */
const auth = (...requiredRoles: string[]) => {
  const optional = requiredRoles.includes('optional');
  const roles = requiredRoles.filter((r) => r !== 'optional');

  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const token = req.cookies?.sg_session;

      if (!token) {
        if (optional) return next();
        return next(new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!'));
      }

      const decoded = verifyToken(token, config.jwt_access_secret);

      if (roles.length && !roles.includes(decoded.role)) {
        return next(
          new AppError(StatusCodes.FORBIDDEN, 'You do not have the required permissions!'),
        );
      }

      req.user = decoded as JwtPayload & { userId: string; role: string };
      next();
    } catch {
      if (optional) return next();
      next(new AppError(StatusCodes.UNAUTHORIZED, 'Invalid or expired session!'));
    }
  };
};

export default auth;
