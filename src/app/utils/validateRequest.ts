import { AnyZodObject, ZodEffects, ZodTypeAny } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { catchAsync } from './catchAsync';

type ZodSchema = AnyZodObject | ZodEffects<AnyZodObject>;

const validateRequest = (schema: ZodSchema) => {
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
