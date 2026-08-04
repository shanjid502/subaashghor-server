import express from 'express';
import { NewsletterController } from './newsletter.controller';
import validateRequest from '../../utils/validateRequest';
import { NewsletterValidation } from './newsletter.validation';

const router = express.Router();

router.post(
  '/subscribe',
  validateRequest(NewsletterValidation.subscribeSchema),
  NewsletterController.subscribe,
);

export const NewsletterRoutes = router;
