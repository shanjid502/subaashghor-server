import express from 'express';
import { NewsletterControllers } from '../Newsletter/newsletter.controller';

const router = express.Router();

router.post('/', NewsletterControllers.captureLead);

export const LeadRoutes = router;
