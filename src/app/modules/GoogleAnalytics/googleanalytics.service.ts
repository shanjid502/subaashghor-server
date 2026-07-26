import { google } from 'googleapis';
import config from '../../config';
import logger from '../../utils/logger';

/**
 * Builds a GoogleAuth client using either a service account key file path
 * (GOOGLE_SERVICE_ACCOUNT_KEY_PATH) or inline JSON (GOOGLE_SERVICE_ACCOUNT_JSON).
 * Uses the google-auth-library bundled inside googleapis to avoid type conflicts.
 */
function getAuthClient(scopes: string[]) {
  const keyJson = config.google_service_account_json;
  const keyFile = config.google_service_account_key_path;

  if (keyJson) {
    const credentials = JSON.parse(keyJson);
    return new google.auth.GoogleAuth({ credentials, scopes });
  }
  if (keyFile) {
    return new google.auth.GoogleAuth({ keyFile, scopes });
  }
  throw new Error(
    'No Google service account credentials configured. Set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SERVICE_ACCOUNT_KEY_PATH.',
  );
}

// ─── GA4 Data API ─────────────────────────────────────────────────────────────

export interface GA4MetricsResult {
  sessions: number;
  pageViews: number;
  activeUsers: number;
  bounceRate: number;
  avgSessionDuration: number; // seconds
  dateRange: '7d' | '28d' | '90d';
}

export interface GA4TopPage {
  pagePath: string;
  sessions: number;
  pageViews: number;
}

/**
 * Fetches overview metrics from the GA4 Data API.
 * Requires: GA4 Property ID and a service account with "Viewer" role on the property.
 */
const getGA4Overview = async (dateRange: '7d' | '28d' | '90d' = '28d'): Promise<GA4MetricsResult> => {
  const propertyId = config.ga4_property_id;
  if (!propertyId) throw new Error('GA4_PROPERTY_ID is not configured.');

  const auth = getAuthClient(['https://www.googleapis.com/auth/analytics.readonly']);
  const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

  const daysMap: Record<string, string> = { '7d': '7daysAgo', '28d': '28daysAgo', '90d': '90daysAgo' };

  const res = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate: daysMap[dateRange], endDate: 'today' }],
      metrics: [
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
    },
  });

  const row = res.data.rows?.[0]?.metricValues;
  if (!row) throw new Error('No data returned from GA4 API.');

  return {
    sessions: parseInt(row[0]?.value ?? '0'),
    pageViews: parseInt(row[1]?.value ?? '0'),
    activeUsers: parseInt(row[2]?.value ?? '0'),
    bounceRate: parseFloat(row[3]?.value ?? '0'),
    avgSessionDuration: parseFloat(row[4]?.value ?? '0'),
    dateRange,
  };
};

/**
 * Fetches top pages by sessions from GA4.
 */
const getGA4TopPages = async (limit = 10): Promise<GA4TopPage[]> => {
  const propertyId = config.ga4_property_id;
  if (!propertyId) throw new Error('GA4_PROPERTY_ID is not configured.');

  const auth = getAuthClient(['https://www.googleapis.com/auth/analytics.readonly']);
  const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

  const res = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    },
  });

  const rows = res.data.rows ?? [];
  return rows.slice(0, limit).map((row: any) => ({
    pagePath: row.dimensionValues?.[0]?.value ?? '',
    sessions: parseInt(row.metricValues?.[0]?.value ?? '0'),
    pageViews: parseInt(row.metricValues?.[1]?.value ?? '0'),
  }));
};

// ─── Search Console API ────────────────────────────────────────────────────────

export interface GSCOverview {
  totalClicks: number;
  totalImpressions: number;
  avgCTR: number;
  avgPosition: number;
  dateRange: '7d' | '28d' | '90d';
}

export interface GSCTopQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCTopPage {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

const fmt = (d: Date) => d.toISOString().split('T')[0];

function getDateRange(days: number): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { startDate: fmt(start), endDate: fmt(end) };
}

/**
 * Fetches overall Search Console performance summary.
 */
const getGSCOverview = async (dateRange: '7d' | '28d' | '90d' = '28d'): Promise<GSCOverview> => {
  const siteUrl = config.gsc_site_url;
  if (!siteUrl) throw new Error('GSC_SITE_URL is not configured.');

  const auth = getAuthClient(['https://www.googleapis.com/auth/webmasters.readonly']);
  const webmasters = google.webmasters({ version: 'v3', auth });

  const daysMap: Record<string, number> = { '7d': 7, '28d': 28, '90d': 90 };
  const { startDate, endDate } = getDateRange(daysMap[dateRange]);

  const res = await webmasters.searchanalytics.query({
    siteUrl,
    requestBody: { startDate, endDate, rowLimit: 25000 },
  });

  const rows = res.data.rows ?? [];
  const totalClicks = rows.reduce((s, r) => s + (r.clicks ?? 0), 0);
  const totalImpressions = rows.reduce((s, r) => s + (r.impressions ?? 0), 0);
  const avgCTR = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const avgPosition = rows.length > 0 ? rows.reduce((s, r) => s + (r.position ?? 0), 0) / rows.length : 0;

  return { totalClicks, totalImpressions, avgCTR, avgPosition, dateRange };
};

/**
 * Fetches top search queries from GSC.
 */
const getGSCTopQueries = async (limit = 10): Promise<GSCTopQuery[]> => {
  const siteUrl = config.gsc_site_url;
  if (!siteUrl) throw new Error('GSC_SITE_URL is not configured.');

  const auth = getAuthClient(['https://www.googleapis.com/auth/webmasters.readonly']);
  const webmasters = google.webmasters({ version: 'v3', auth });

  const { startDate, endDate } = getDateRange(28);

  const res = await webmasters.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit: limit,
    },
  });

  return (res.data.rows ?? [])
    .sort((a, b) => (b.clicks ?? 0) - (a.clicks ?? 0))
    .map((row) => ({
      query: row.keys?.[0] ?? '',
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    }));
};

/**
 * Fetches top performing pages from GSC.
 */
const getGSCTopPages = async (limit = 10): Promise<GSCTopPage[]> => {
  const siteUrl = config.gsc_site_url;
  if (!siteUrl) throw new Error('GSC_SITE_URL is not configured.');

  const auth = getAuthClient(['https://www.googleapis.com/auth/webmasters.readonly']);
  const webmasters = google.webmasters({ version: 'v3', auth });

  const { startDate, endDate } = getDateRange(28);

  const res = await webmasters.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['page'],
      rowLimit: limit,
    },
  });

  return (res.data.rows ?? [])
    .sort((a, b) => (b.clicks ?? 0) - (a.clicks ?? 0))
    .map((row) => ({
      page: row.keys?.[0] ?? '',
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    }));
};

// ─── Google Indexing API ───────────────────────────────────────────────────────

/**
 * Requests instant indexing of a URL via the Google Indexing API.
 * For general pages, pair with sitemap ping for best results.
 */
const requestInstantIndex = async (
  url: string,
): Promise<{ notified: boolean; urlNotificationMetadata?: object }> => {
  try {
    const auth = getAuthClient(['https://www.googleapis.com/auth/indexing']);
    const indexing = google.indexing({ version: 'v3', auth });

    const res = await indexing.urlNotifications.publish({
      requestBody: { url, type: 'URL_UPDATED' },
    });

    logger.info(`Google Indexing API: notified for ${url}`);
    return { notified: true, urlNotificationMetadata: res.data as object };
  } catch (err: any) {
    logger.warn(`Google Indexing API failed for ${url}: ${err?.message}`);
    return { notified: false };
  }
};

export const GoogleAnalyticsService = {
  getGA4Overview,
  getGA4TopPages,
  getGSCOverview,
  getGSCTopQueries,
  getGSCTopPages,
  requestInstantIndex,
};
