import { ZodType } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { catchAsync } from './catchAsync';

const validateRequest = (schema: ZodType) => {
  return catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
      cookies: req.cookies,
    });
    return next();
  });
};

export default validateRequest;
