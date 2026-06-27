import express from 'express';
import { CollectionController } from './collection.controller';

const router = express.Router();

router.get('/', CollectionController.getAllCollections);
router.get('/:slug', CollectionController.getCollectionBySlug);

// Admin / Upload endpoints
router.post('/', CollectionController.createCollection);
router.patch('/:id', CollectionController.updateCollection);
router.delete('/:id', CollectionController.deleteCollection);

export const CollectionRoutes = router;
