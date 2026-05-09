import express from 'express';
import { WishlistControllers } from './wishlist.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.get('/', auth('customer', 'admin'), WishlistControllers.getWishlist);
router.post('/', auth('customer', 'admin'), WishlistControllers.addToWishlist);
router.delete('/:slug', auth('customer', 'admin'), WishlistControllers.removeFromWishlist);

export const WishlistRoutes = router;
