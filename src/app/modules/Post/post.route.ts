import express from 'express';
import { PostControllers } from './post.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.get('/', PostControllers.getAllPosts);
router.get('/:slug', PostControllers.getPostBySlug);
router.post('/', auth('admin'), PostControllers.createPost);
router.patch('/:slug', auth('admin'), PostControllers.updatePost);

export const PostRoutes = router;
