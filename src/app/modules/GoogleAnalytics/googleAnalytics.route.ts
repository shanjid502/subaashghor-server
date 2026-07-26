import express from 'express';
import auth from '../../middlewares/auth.middleware';
import { USER_ROLE } from '../Auth/auth.constant';
import { GoogleAnalyticsController } from './googleAnalytics.controller';

const router = express.Router();

// All routes are admin-only — these endpoints expose private analytics data
router.use(auth(USER_ROLE.admin));

// ─── GA4 ──────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/ga4/overview?range=28d
router.get('/ga4/overview', GoogleAnalyticsController.getGA4Overview);
// GET /api/v1/analytics/ga4/top-pages?limit=10
router.get('/ga4/top-pages', GoogleAnalyticsController.getGA4TopPages);

// ─── Search Console ───────────────────────────────────────────────────────────
// GET /api/v1/analytics/gsc/overview?range=28d
router.get('/gsc/overview', GoogleAnalyticsController.getGSCOverview);
// GET /api/v1/analytics/gsc/top-queries?limit=10
router.get('/gsc/top-queries', GoogleAnalyticsController.getGSCTopQueries);
// GET /api/v1/analytics/gsc/top-pages?limit=10
router.get('/gsc/top-pages', GoogleAnalyticsController.getGSCTopPages);

// ─── Indexing API ─────────────────────────────────────────────────────────────
// POST /api/v1/analytics/indexing/request { url: "https://..." }
router.post('/indexing/request', GoogleAnalyticsController.requestInstantIndex);

export const GoogleAnalyticsRoutes = router;
