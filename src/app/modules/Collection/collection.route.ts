import express from 'express';
import { CollectionController } from './collection.controller';

const router = express.Router();

router.get('/', CollectionController.getAllCollections);
router.get('/:slug', CollectionController.getCollectionBySlug);

export const CollectionRoutes = router;
