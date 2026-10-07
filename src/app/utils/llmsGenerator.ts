import { ProductModel } from '../modules/Product/product.model';
import { PostModel } from '../modules/Post/post.model';

const BASE_URL = process.env.STOREFRONT_URL || 'https://subaashghor.com';

/**
 * Strips HTML tags and converts markup to clean plain text / Markdown.
 */
function cleanHtmlToMarkdown(html: string): string {
  if (!html) return '';
  return html
    // Convert <a> tags to plain text
    .replace(/<a\s+(?:[^>]*?\s+)?href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '$2')
    // Convert <strong>, <b> to bold **text**
    .replace(/<(?:strong|b)>(.*?)<\/(?:strong|b)>/gi, '**$1**')
    // Convert <em>, <i> to italic *text*
    .replace(/<(?:em|i)>(.*?)<\/(?:em|i)>/gi, '*$1*')
    // Convert headings and paragraphs to whitespace
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, ' $1. ')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, ' $1 ')
    .replace(/<br\s*\/?>/gi, ' ')
    // Strip all remaining HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Decode common HTML entities
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    // Normalize consecutive whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates the full llms.txt (and llm.txt) content dynamically from the live
 * MongoDB catalogue.  Called on every request — the response is cache-controlled
 * at the HTTP layer (max-age=3600) so MongoDB is hit at most once per hour.
 */
export const generateLlmsTxt = async (): Promise<string> => {
  const timestamp = new Date().toISOString();

  // ── 1. Fetch live data ──────────────────────────────────────────────────────
  const [products, postsResult] = await Promise.all([
    ProductModel.find({ isActive: true })
      .select('name tagline description category sizes slug images')
      .sort({ createdAt: -1 })
      .lean(),
    PostModel.find({ published: true, date: { $lte: new Date() } })
      .select('title slug date excerpt')
      .sort({ date: -1 })
      .lean(),
  ]);

  // ── 2. Build the header section ─────────────────────────────────────────────
  const lines: string[] = [
    '# Subaashghor — House of Pure Fragrance',
    '',
    '> Welcome to Subaashghor, a premium house of artisanal halal perfumes, attars, pure oud, and modern scents based in Bangladesh.',
    '',
    'This is an LLM-friendly documentation page containing the structure, routes, products, and articles of Subaashghor. Use it to search, navigate, or understand our storefront offerings.',
    '',
    '## Main Storefront Pages',
    `- [Home](${BASE_URL}/) - Elegant storefront landing page featuring top sellers, brand story, and active announcements.`,
    `- [All Fragrances / Shop](${BASE_URL}/shop) - Entire product catalogue with size, price, and category filters (Men, Women, Unisex, Attar).`,
    `- [Collections](${BASE_URL}/collections) - Curated collection groups such as Pure Attar Oils, Masculine, and Feminine blends.`,
    `- [Heritage](${BASE_URL}/heritage) - Learn about our traditional hand-blending, maturation processes, and ingredients.`,
    `- [Blog](${BASE_URL}/blog) - Fragrance care advice, seasonal guides, and the ancient art of attar layering.`,
    `- [Scent Finder](${BASE_URL}/scent-finder) - Interactive scent discovery wizard matching preferences to recommendations.`,
    `- [Contact](${BASE_URL}/contact) - Contact form, phone numbers, and maps to find our local presence.`,
    '',
  ];

  // ── 3. Products section ─────────────────────────────────────────────────────
  lines.push(`## Product Catalog (${products.length} Items)`);
  lines.push('');

  for (const p of products as any[]) {
    const name = p.name?.en || 'Unnamed';
    const nameBn = p.name?.bn || '';
    const tagline = cleanHtmlToMarkdown(p.tagline?.en || '');
    const description = cleanHtmlToMarkdown(p.description?.en || '');
    const category = p.category || '';
    const slug = p.slug || '';

    // Determine display price from size variants (cheapest available)
    let priceStr = '';
    if (Array.isArray(p.sizes) && p.sizes.length > 0) {
      const sorted = [...p.sizes].sort((a: any, b: any) => (a.salePrice || a.price) - (b.salePrice || b.price));
      const cheapest = sorted[0];
      const effectivePrice = cheapest.salePrice || cheapest.price;
      const wasPrice = cheapest.salePrice ? cheapest.price : null;
      priceStr = `৳${effectivePrice.toLocaleString()}${wasPrice ? ` (was ৳${wasPrice.toLocaleString()})` : ''}`;
      if (sorted.length > 1) {
        const mostExpensive = sorted[sorted.length - 1];
        const maxPrice = mostExpensive.salePrice || mostExpensive.price;
        if (maxPrice !== effectivePrice) {
          priceStr += ` – ৳${maxPrice.toLocaleString()}`;
        }
      }
    }

    lines.push(`### [${name}](${BASE_URL}/products/${slug})`);
    if (nameBn) lines.push(`*Bengali name: ${nameBn}*`);
    if (tagline) lines.push(`- **Tagline**: ${tagline}`);
    lines.push(`- **Category**: ${category}${priceStr ? ` | **Price**: ${priceStr}` : ''}`);
    if (description) lines.push(`- **Description**: ${description}`);
    lines.push('');
  }

  // ── 4. Blog section ─────────────────────────────────────────────────────────
  if ((postsResult as any[]).length > 0) {
    lines.push(`## Fragrance Advice & Blog Articles (${(postsResult as any[]).length} Posts)`);
    lines.push('');

    for (const post of postsResult as any[]) {
      const title = post.title?.en || post.title || 'Untitled';
      const slug = post.slug || '';
      const excerpt = cleanHtmlToMarkdown(post.excerpt?.en || post.excerpt || '');
      const dateStr = post.date
        ? new Date(post.date).toISOString().split('T')[0]
        : '';

      const datePart = dateStr ? ` (${dateStr})` : '';
      const excerptPart = excerpt ? ` — ${excerpt}` : '';
      lines.push(`- [${title}](${BASE_URL}/blog/${slug})${datePart}${excerptPart}`);
    }
    lines.push('');
  }

  // ── 5. Footer ───────────────────────────────────────────────────────────────
  lines.push('---');
  lines.push(`*Generated automatically for LLM agents on ${timestamp}*`);
  lines.push('');

  return lines.join('\n');
};
