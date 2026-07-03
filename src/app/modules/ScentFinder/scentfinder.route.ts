import express from 'express';
import { ScentFinderController } from './scentfinder.controller';
import auth from '../../middlewares/auth.middleware';
import { USER_ROLE } from '../Auth/auth.constant';
import validateRequest from '../../utils/validateRequest';
import { ScentFinderValidation } from './scentfinder.validation';

const router = express.Router();

// Public read access to quiz questions
router.get('/', ScentFinderController.getAllQuestions);

// Admin-only write/delete actions
router.post(
  '/',
  auth(USER_ROLE.admin),
  validateRequest(ScentFinderValidation.createQuestionSchema),
  ScentFinderController.createQuestion,
);
router.delete('/:id', auth(USER_ROLE.admin), ScentFinderController.deleteQuestion);

export const ScentFinderRoutes = router;
