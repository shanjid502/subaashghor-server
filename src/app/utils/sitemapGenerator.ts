import { ProductModel } from '../modules/Product/product.model';
import { PostModel } from '../modules/Post/post.model';
import logger from './logger';

const BASE_URL = process.env.STOREFRONT_URL || 'https://subaashghor.com';

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

/**
 * Generates a complete sitemap.xml string by fetching live slugs from MongoDB.
 */
export const generateSitemapXml = async (): Promise<string> => {
  const today = new Date().toISOString().split('T')[0];

  // Static routes
  const staticEntries: SitemapEntry[] = [
    { loc: '/', changefreq: 'weekly', priority: '1.0' },
    { loc: '/shop', changefreq: 'daily', priority: '0.9' },
    { loc: '/collections', changefreq: 'weekly', priority: '0.8' },
    { loc: '/heritage', changefreq: 'monthly', priority: '0.6' },
    { loc: '/blog', changefreq: 'weekly', priority: '0.8' },
    { loc: '/scent-finder', changefreq: 'monthly', priority: '0.7' },
    { loc: '/contact', changefreq: 'yearly', priority: '0.5' },
  ];

  // Live products from DB
  const products = await ProductModel.find({ isActive: true }, { slug: 1, updatedAt: 1 }).lean();
  const productEntries: SitemapEntry[] = products.map((p: any) => ({
    loc: `/products/${p.slug}`,
    lastmod: p.updatedAt ? new Date(p.updatedAt as Date).toISOString().split('T')[0] : today,
    changefreq: 'weekly',
    priority: '0.8',
  }));

  // Live blog posts from DB
  const posts = await PostModel.find({ published: true }, { slug: 1, updatedAt: 1 }).lean();
  const postEntries: SitemapEntry[] = posts.map((p: any) => ({
    loc: `/blog/${p.slug}`,
    lastmod: p.updatedAt ? new Date(p.updatedAt as Date).toISOString().split('T')[0] : today,
    changefreq: 'monthly',
    priority: '0.6',
  }));

  const all = [...staticEntries, ...productEntries, ...postEntries];

  const urlBlocks = all.map((e) => {
    const lines = [
      '  <url>',
      `    <loc>${BASE_URL}${e.loc}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      '  </url>',
    ]
      .filter(Boolean)
      .join('\n');
    return lines;
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urlBlocks,
    '</urlset>',
    '',
  ].join('\n');
};

/**
 * 7.3 Pings Google Search Console to re-crawl the sitemap.
 * Called after new products or posts are published.
 */
export const pingSitemapToGoogle = async (): Promise<void> => {
  const sitemapUrl = encodeURIComponent(`${BASE_URL}/sitemap.xml`);
  const pingUrl = `https://www.google.com/ping?sitemap=${sitemapUrl}`;

  try {
    const res = await fetch(pingUrl, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      logger.info(`Sitemap pinged to Google: ${pingUrl}`);
    } else {
      logger.warn(`Google sitemap ping returned HTTP ${res.status}`);
    }
  } catch (err: any) {
    logger.warn(`Google sitemap ping failed: ${err?.message}`);
  }
};
