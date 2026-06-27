import express from 'express';
import { PostController } from './post.controller';

const router = express.Router();

router.get('/', PostController.getAllPosts);
router.get('/:slug', PostController.getPostBySlug);

export const PostRoutes = router;
