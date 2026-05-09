import express from 'express';
import { CollectionControllers } from './collection.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.get('/', CollectionControllers.getAllCollections);
router.get('/:slug', CollectionControllers.getCollectionBySlug);
router.post('/', auth('admin'), CollectionControllers.createCollection);
router.patch('/:slug', auth('admin'), CollectionControllers.updateCollection);

export const CollectionRoutes = router;
