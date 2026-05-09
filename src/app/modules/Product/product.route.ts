import express from 'express';
import { ProductControllers } from './product.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.get('/', ProductControllers.getAllProducts);
router.get('/featured', ProductControllers.getFeaturedProducts);
router.get('/:slug', ProductControllers.getProductBySlug);

// Admin-only management
router.post('/', auth('admin'), ProductControllers.createProduct);
router.patch('/:slug', auth('admin'), ProductControllers.updateProduct);
router.delete('/:slug', auth('admin'), ProductControllers.deleteProduct);

export const ProductRoutes = router;
