import express from 'express';
import { PostController } from './post.controller';
import auth from '../../middlewares/auth.middleware';

const router = express.Router();

router.get('/', PostController.getAllPosts);
router.get('/:slug', PostController.getPostBySlug);

// Admin / Upload endpoints
router.post('/', auth('admin'), PostController.createPost);
router.patch('/:id', auth('admin'), PostController.updatePost);
router.delete('/:id', auth('admin'), PostController.deletePost);

export const PostRoutes = router;
