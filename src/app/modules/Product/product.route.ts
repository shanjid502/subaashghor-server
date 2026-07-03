import express from 'express';
import multer from 'multer';
import { ProductController } from './product.controller';
import auth from '../../middlewares/auth.middleware';
import { USER_ROLE } from '../Auth/auth.constant';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', ProductController.getAllProducts);
router.get('/featured', ProductController.getFeaturedProducts);

// Admin / Inventory endpoints
router.get('/export-inventory', auth(USER_ROLE.admin), ProductController.exportInventoryCSV);
router.post('/bulk-update', auth(USER_ROLE.admin), upload.single('file'), ProductController.bulkUpdateProducts);

router.get('/:slug', ProductController.getProductBySlug);

// Admin / CRUD endpoints
router.post('/', auth(USER_ROLE.admin), ProductController.createProduct);
router.patch('/:id', auth(USER_ROLE.admin), ProductController.updateProduct);
router.delete('/:id', auth(USER_ROLE.admin), ProductController.deleteProduct);

export const ProductRoutes = router;
