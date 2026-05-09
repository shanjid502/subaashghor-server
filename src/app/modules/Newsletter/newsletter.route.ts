import express from 'express';
import { NewsletterControllers } from './newsletter.controller';

const router = express.Router();

router.post('/subscribe', NewsletterControllers.subscribe);

export const NewsletterRoutes = router;
