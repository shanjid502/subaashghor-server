import express from 'express';
import { CollectionControllers } from './collection.controller';

const router = express.Router();

router.post('/', CollectionControllers.createCollection);
router.get('/', CollectionControllers.getAllCollections);
router.get('/:id', CollectionControllers.getSingleCollection);
router.patch('/:id', CollectionControllers.updateCollection);
router.delete('/:id', CollectionControllers.deleteCollection);

export const CollectionRoutes = router;
