import express from 'express';
import multer from 'multer';
import { ProductController } from './product.controller';
import auth, { optionalAuth } from '../../middlewares/auth.middleware';
import { USER_ROLE } from '../Auth/auth.constant';

const router = express.Router();

// Memory storage — buffers are passed to Cloudinary, never written to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
});

// Fields accepted for product create / update
const productImageFields = upload.fields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 },
  { name: 'socialImage',   maxCount: 1 },
]);

router.get('/', optionalAuth, ProductController.getAllProducts);
router.get('/featured', optionalAuth, ProductController.getFeaturedProducts);

// Admin / Inventory endpoints
router.get('/export-inventory', auth(USER_ROLE.admin), ProductController.exportInventoryCSV);
router.post('/bulk-update', auth(USER_ROLE.admin), upload.single('file'), ProductController.bulkUpdateProducts);

router.get('/:slug', optionalAuth, ProductController.getProductBySlug);

// Admin / CRUD endpoints
router.post('/',    auth(USER_ROLE.admin), productImageFields, ProductController.createProduct);
router.patch('/:id', auth(USER_ROLE.admin), productImageFields, ProductController.updateProduct);
router.delete('/:id', auth(USER_ROLE.admin), ProductController.deleteProduct);

export const ProductRoutes = router;
