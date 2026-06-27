import express from 'express';
import { PostController } from './post.controller';

const router = express.Router();

router.get('/', PostController.getAllPosts);
router.get('/:slug', PostController.getPostBySlug);

// Admin / Upload endpoints
router.post('/', PostController.createPost);
router.patch('/:id', PostController.updatePost);
router.delete('/:id', PostController.deletePost);

export const PostRoutes = router;
