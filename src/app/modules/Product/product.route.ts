import express from 'express';
import { ProductController } from './product.controller';
import auth from '../../middlewares/auth.middleware';
import { USER_ROLE } from '../Auth/auth.constant';

const router = express.Router();

router.get('/', ProductController.getAllProducts);
router.get('/featured', ProductController.getFeaturedProducts);
router.get('/:slug', ProductController.getProductBySlug);

// Admin / Upload endpoints
router.post('/', auth(USER_ROLE.admin), ProductController.createProduct);
router.patch('/:id', auth(USER_ROLE.admin), ProductController.updateProduct);
router.delete('/:id', auth(USER_ROLE.admin), ProductController.deleteProduct);

export const ProductRoutes = router;
