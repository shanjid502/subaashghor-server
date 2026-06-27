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
// --- INJECT IMPORTS HERE ---

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
