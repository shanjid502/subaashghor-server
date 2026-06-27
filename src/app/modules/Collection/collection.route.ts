import express from 'express';
import { CollectionController } from './collection.controller';
import auth from '../../middlewares/auth.middleware';

const router = express.Router();

router.get('/', CollectionController.getAllCollections);
router.get('/:slug', CollectionController.getCollectionBySlug);

// Admin / Upload endpoints
router.post('/', auth('admin'), CollectionController.createCollection);
router.patch('/:id', auth('admin'), CollectionController.updateCollection);
router.delete('/:id', auth('admin'), CollectionController.deleteCollection);

export const CollectionRoutes = router;
