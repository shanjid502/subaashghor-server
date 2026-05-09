import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { ProductRoutes } from '../modules/Product/product.route';
import { CollectionRoutes } from '../modules/Collection/collection.route';
import { PostRoutes } from '../modules/Post/post.route';
import { CouponRoutes } from '../modules/Coupon/coupon.route';
import { ReviewRoutes } from '../modules/Review/review.route';
import { OrderRoutes } from '../modules/Order/order.route';
import { ProfileRoutes } from '../modules/Profile/profile.route';
import { AddressRoutes } from '../modules/Profile/address.route';
import { WishlistRoutes } from '../modules/Wishlist/wishlist.route';
import { NewsletterRoutes } from '../modules/Newsletter/newsletter.route';
import { LeadRoutes } from '../modules/Newsletter/lead.route';
import { NotifyMeRoutes } from '../modules/NotifyMe/notifyMe.route';
import { SiteConfigRoutes } from '../modules/SiteConfig/siteConfig.route';
import { WebhookRoutes } from '../modules/Webhook/webhook.route';

const router = Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/products', route: ProductRoutes },
  { path: '/collections', route: CollectionRoutes },
  { path: '/posts', route: PostRoutes },
  { path: '/coupons', route: CouponRoutes },
  { path: '/reviews', route: ReviewRoutes },
  { path: '/orders', route: OrderRoutes },
  { path: '/profile', route: ProfileRoutes },
  { path: '/addresses', route: AddressRoutes },
  { path: '/wishlist', route: WishlistRoutes },
  { path: '/newsletter', route: NewsletterRoutes },
  { path: '/leads', route: LeadRoutes },
  { path: '/notify-me', route: NotifyMeRoutes },
  { path: '/site-config', route: SiteConfigRoutes },
  // Public webhooks (no auth guard here — each webhook handles its own verification)
  { path: '/public/webhooks', route: WebhookRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
