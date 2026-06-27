import express from 'express';
import { CollectionController } from './collection.controller';
import auth from '../../middlewares/auth.middleware';
import { USER_ROLE } from '../Auth/auth.constant';

const router = express.Router();

router.get('/', CollectionController.getAllCollections);
router.get('/:slug', CollectionController.getCollectionBySlug);

// Admin / Upload endpoints
router.post('/', auth(USER_ROLE.admin), CollectionController.createCollection);
router.patch('/:id', auth(USER_ROLE.admin), CollectionController.updateCollection);
router.delete('/:id', auth(USER_ROLE.admin), CollectionController.deleteCollection);

export const CollectionRoutes = router;
