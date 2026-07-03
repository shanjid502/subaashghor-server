import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { UserRoutes } from '../modules/User/user.route';
import { ProductRoutes } from '../modules/Product/product.route';
import { CollectionRoutes } from '../modules/Collection/collection.route';
import { PostRoutes } from '../modules/Post/post.route';
import { ReviewRoutes } from '../modules/Review/review.route';
import { CouponRoutes } from '../modules/Coupon/coupon.route';
import { OrderRoutes } from '../modules/Order/order.route';
import { NewslatterRoutes } from '../modules/Newslatter/newslatter.route';
import { UploadRoutes } from '../modules/Upload/upload.route';
import { SettingsRoutes } from '../modules/Settings/settings.route';
import { ScentFinderRoutes } from '../modules/ScentFinder/scentfinder.route';
import { ProductController } from '../modules/Product/product.controller';
// --- INJECT IMPORTS HERE ---
const fbFeedRouter = Router();
fbFeedRouter.get('/', ProductController.getFacebookProductFeed);

const router = Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/', route: UserRoutes }, // profile & addresses are top-level
  { path: '/products', route: ProductRoutes },
  { path: '/collections', route: CollectionRoutes },
  { path: '/posts', route: PostRoutes },
  { path: '/reviews', route: ReviewRoutes },
  { path: '/coupons', route: CouponRoutes },
  { path: '/orders', route: OrderRoutes },
  { path: '/newsletter', route: NewslatterRoutes },
  { path: '/uploads', route: UploadRoutes },
  { path: '/settings', route: SettingsRoutes },
  { path: '/scent-finder/questions', route: ScentFinderRoutes },
  { path: '/fb-product-feed', route: fbFeedRouter },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
