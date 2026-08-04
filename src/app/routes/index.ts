import { Router, Request, Response } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { UserRoutes } from '../modules/User/user.route';
import { ProductRoutes } from '../modules/Product/product.route';
import { CollectionRoutes } from '../modules/Collection/collection.route';
import { PostRoutes } from '../modules/Post/post.route';
import { ReviewRoutes } from '../modules/Review/review.route';
import { CouponRoutes } from '../modules/Coupon/coupon.route';
import { OrderRoutes } from '../modules/Order/order.route';
import { NewsletterRoutes } from '../modules/Newsletter/newsletter.route';
import { UploadRoutes } from '../modules/Upload/upload.route';
import { SettingsRoutes } from '../modules/Settings/settings.route';
import { ScentFinderRoutes } from '../modules/ScentFinder/scentfinder.route';
import { RedirectRoutes } from '../modules/Redirect/redirect.route';
import { ProductController } from '../modules/Product/product.controller';
import { GoogleAnalyticsRoutes } from '../modules/GoogleAnalytics/googleanalytics.route';
import { generateSitemapXml } from '../utils/sitemapGenerator';
import { SettingsModel } from '../modules/Settings/settings.model';
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
  { path: '/newsletter', route: NewsletterRoutes },
  { path: '/newslatter', route: NewsletterRoutes }, // Legacy backward-compatibility alias
  { path: '/uploads', route: UploadRoutes },
  { path: '/settings', route: SettingsRoutes },
  { path: '/scent-finder/questions', route: ScentFinderRoutes },
  { path: '/fb-product-feed', route: fbFeedRouter },
  { path: '/redirects', route: RedirectRoutes },
  { path: '/analytics', route: GoogleAnalyticsRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

// 7.3 Dynamic sitemap.xml — generated live from MongoDB
router.get('/sitemap.xml', async (_req: Request, res: Response) => {
  try {
    const xml = await generateSitemapXml();
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache 1h
    res.send(xml);
  } catch {
    res.status(500).send('Failed to generate sitemap');
  }
});

// 7.3 Dynamic robots.txt — editable from the dashboard
router.get('/robots.txt', async (_req: Request, res: Response) => {
  try {
    const settings = await SettingsModel.findOne().lean();
    const robotsTxt = (settings as any)?.robotsTxt as string | undefined;
    const defaultRobots = `User-agent: *\nAllow: /\nDisallow: /account\nDisallow: /checkout\nDisallow: /cart\nDisallow: /thank-you/\n\nSitemap: ${process.env.STOREFRONT_URL || 'https://subaashghor.com'}/sitemap.xml`;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache 24h
    res.send(robotsTxt || defaultRobots);
  } catch {
    res.status(500).send('Failed to load robots.txt');
  }
});

export default router;
