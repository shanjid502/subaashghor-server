import express from 'express';
import { NewslatterController } from './newslatter.controller';
import validateRequest from '../../utils/validateRequest';
import { NewslatterValidation } from './newslatter.validation';

const router = express.Router();

router.post(
  '/subscribe',
  validateRequest(NewslatterValidation.subscribeSchema),
  NewslatterController.subscribe,
);

export const NewslatterRoutes = router;
