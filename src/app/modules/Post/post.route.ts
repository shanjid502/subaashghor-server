import express from 'express';
import { PostController } from './post.controller';
import auth from '../../middlewares/auth.middleware';
import { USER_ROLE } from '../Auth/auth.constant';

const router = express.Router();

router.get('/', PostController.getAllPosts);
router.get('/:slug', PostController.getPostBySlug);

// Admin / Upload endpoints
router.post('/', auth(USER_ROLE.admin), PostController.createPost);
router.patch('/:id', auth(USER_ROLE.admin), PostController.updatePost);
router.delete('/:id', auth(USER_ROLE.admin), PostController.deletePost);

export const PostRoutes = router;
