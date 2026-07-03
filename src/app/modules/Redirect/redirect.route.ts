import express from 'express';
import { RedirectController } from './redirect.controller';
import auth from '../../middlewares/auth.middleware';
import { USER_ROLE } from '../Auth/auth.constant';

const router = express.Router();

router.get('/resolve', RedirectController.resolveRedirect);
router.get('/', auth(USER_ROLE.admin), RedirectController.getAllRedirects);
router.post('/', auth(USER_ROLE.admin), RedirectController.createRedirect);
router.patch('/:id', auth(USER_ROLE.admin), RedirectController.updateRedirect);
router.delete('/:id', auth(USER_ROLE.admin), RedirectController.deleteRedirect);

export const RedirectRoutes = router;
