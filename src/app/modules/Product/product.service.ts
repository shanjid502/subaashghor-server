import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { ProductModel } from './product.model';
import { checkAndNotifyLowStock } from '../../utils/stockNotifier';
import { pingSitemapToGoogle } from '../../utils/sitemapGenerator';
import { uploadBuffer } from '../../utils/cloudinary';

/** Shape returned by the controller helper */
interface FileBuffers {
  featuredImageBuffer: Buffer | null;
  galleryBuffers: Buffer[];
  socialImageBuffer: Buffer | null;
}

/**
 * FormData sends everything as strings.
 * This helper safely JSON-parses a field that was serialised on the client.
 */
const parseField = <T>(value: unknown, fallback: T): T => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value !== 'string') return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

/**
 * Upload an array of Buffers to Cloudinary in parallel and return their URLs.
 * If a buffer is null/undefined it is skipped.
 */
const uploadBuffers = async (
  buffers: (Buffer | null)[],
  folder: string,
): Promise<string[]> => {
  const results = await Promise.all(
    buffers
      .filter((b): b is Buffer => !!b)
      .map(b => uploadBuffer(b, folder)),
  );
  return results.map(r => r.url);
};

const sanitizeProductForPublic = (product: any) => {
  if (!product) return product;
  const obj = typeof product.toObject === 'function' ? product.toObject() : { ...product };
  delete obj.costPrice;
  if (Array.isArray(obj.sizes)) {
    obj.sizes = obj.sizes.map((size: any) => {
      const s = { ...size };
      delete s.costPrice;
      return s;
    });
  }
  return obj;
};

const getAllProducts = async (query: Record<string, any>) => {
  const {
    page = 1,
    limit = 100, // Return more products for admin overview
    category,
    collection,
    minPrice,
    maxPrice,
    notes,
    sort = 'newest',
    q,
    isAdmin = false,
  } = query;

  const andConditions: any[] = [];

  // For public client, only show active products
  if (isAdmin !== 'true' && isAdmin !== true) {
    andConditions.push({ isActive: true });
  }

  // Category filter
  if (category) {
    andConditions.push({ category });
  }

  // Collection filter
  if (collection) {
    andConditions.push({ collections: collection });
  }

  // Price filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceFilter: Record<string, any> = {};
    if (minPrice !== undefined) priceFilter.$gte = Number(minPrice);
    if (maxPrice !== undefined) priceFilter.$lte = Number(maxPrice);
    andConditions.push({ price: priceFilter });
  }

  // Notes filter
  if (notes) {
    const notesArray = Array.isArray(notes) ? notes : [notes];
    andConditions.push({
      $or: [
        { 'notes.top': { $in: notesArray } },
        { 'notes.heart': { $in: notesArray } },
        { 'notes.base': { $in: notesArray } },
      ],
    });
  }

  // Search filter
  if (q) {
    const escapedQuery = String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    andConditions.push({
      $or: [
        { 'name.en': { $regex: escapedQuery, $options: 'i' } },
        { 'name.bn': { $regex: escapedQuery, $options: 'i' } },
        { 'tagline.en': { $regex: escapedQuery, $options: 'i' } },
        { 'tagline.bn': { $regex: escapedQuery, $options: 'i' } },
      ],
    });
  }

  const filterObj = andConditions.length > 0 ? { $and: andConditions } : {};

  // Sort order mapping
  let sortStr = '-createdAt';
  if (sort === 'price-asc') sortStr = 'price';
  else if (sort === 'price-desc') sortStr = '-price';
  else if (sort === 'popular') sortStr = '-rating';

  const skip = (Number(page) - 1) * Number(limit);

  const productsQuery = ProductModel.find(filterObj)
    .sort(sortStr)
    .skip(skip)
    .limit(Number(limit));

  let products = await productsQuery;
  const total = await ProductModel.countDocuments(filterObj);

  if (isAdmin !== 'true' && isAdmin !== true) {
    products = products.map(sanitizeProductForPublic);
  }

  return {
    products,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

const getFeaturedProducts = async (isAdmin: boolean = false) => {
  let featured = await ProductModel.find({ isActive: true }).limit(8);
  if (!isAdmin) {
    featured = featured.map(sanitizeProductForPublic);
  }
  return featured;
};

const getProductBySlug = async (slug: string, isAdmin: boolean = false) => {
  // 1. Try finding by slug first
  let product = await ProductModel.findOne({ slug });

  // 2. If not found by slug, fallback to _id lookup (if valid ObjectId format)
  if (!product && slug.match(/^[0-9a-fA-F]{24}$/)) {
    product = await ProductModel.findById(slug);
  }

  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  if (!isAdmin) {
    return sanitizeProductForPublic(product);
  }
  return product;
};

const createProduct = async (payload: any, files: FileBuffers) => {
  // ── 1. Parse FormData fields that were JSON-serialised on the client ──────
  const name        = parseField<{ en: string; bn: string }>(payload.name,        { en: '', bn: '' });
  const tagline     = parseField<{ en: string; bn: string }>(payload.tagline,     { en: '', bn: '' });
  const description = parseField<{ en: string; bn: string }>(payload.description, { en: '', bn: '' });
  const sizes       = parseField<any[]>(payload.sizes,  []);
  const notes       = parseField<any>(payload.notes,    { top: [], heart: [], base: [] });
  const robotsMeta  = parseField<any>(payload.robotsMeta, { noindex: false, nofollow: false, noarchive: false });
  const faqs        = parseField<any[]>(payload.faqs,  []);
  const badges      = parseField<string[]>(payload.badges, []);

  // ── 2. Basic field validation ─────────────────────────────────────────────
  if (!name.en?.trim())       throw new AppError(StatusCodes.BAD_REQUEST, 'English name (name.en) is required');
  if (!name.bn?.trim())       throw new AppError(StatusCodes.BAD_REQUEST, 'Bengali name (name.bn) is required');
  if (!tagline.en?.trim())    throw new AppError(StatusCodes.BAD_REQUEST, 'English tagline is required');
  if (!tagline.bn?.trim())    throw new AppError(StatusCodes.BAD_REQUEST, 'Bengali tagline is required');
  if (!payload.category)      throw new AppError(StatusCodes.BAD_REQUEST, 'Category is required');
  if (!['men','women','attar','unisex'].includes(payload.category))
                              throw new AppError(StatusCodes.BAD_REQUEST, `Invalid category "${payload.category}". Must be men | women | attar | unisex`);
  if (!sizes.length)          throw new AppError(StatusCodes.BAD_REQUEST, 'At least one size variant is required');
  if (!files.featuredImageBuffer && !payload.existingFeaturedImage)
                              throw new AppError(StatusCodes.BAD_REQUEST, 'A featured product image is required');

  // ── 3. Upload images to Cloudinary ────────────────────────────────────────
  let featuredImageUrl: string = payload.existingFeaturedImage || '';
  if (files.featuredImageBuffer) {
    const [url] = await uploadBuffers([files.featuredImageBuffer], 'subaashghor/products');
    featuredImageUrl = url;
  }

  const galleryUrls = await uploadBuffers(files.galleryBuffers, 'subaashghor/products');

  // Merge: keep any existing gallery URLs the client forwarded, add new ones
  const existingGallery: string[] = parseField<string[]>(payload.existingGalleryImages, []);
  const allGalleryUrls = [...existingGallery, ...galleryUrls];

  let socialImageUrl: string = payload.socialImage || '';
  if (files.socialImageBuffer) {
    const [url] = await uploadBuffers([files.socialImageBuffer], 'subaashghor/products');
    socialImageUrl = url;
  }

  // ── 4. Slug generation ────────────────────────────────────────────────────
  let slug: string = payload.slug || '';
  if (!slug && name.en) {
    slug = name.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  if (!slug) throw new AppError(StatusCodes.BAD_REQUEST, 'Could not generate a valid slug from the product name');

  const existingProduct = await ProductModel.findOne({ slug });
  if (existingProduct) {
    throw new AppError(StatusCodes.CONFLICT, `A product with slug "${slug}" already exists. Use a different English name or provide a custom slug.`);
  }

  // ── 5. Build and persist the document ────────────────────────────────────
  const doc = {
    slug,
    name,
    tagline,
    description,
    category: payload.category,
    price: Number(payload.price) || sizes[0]?.price || 0,
    salePrice: payload.salePrice ? Number(payload.salePrice) : undefined,
    costPrice: payload.costPrice !== undefined ? Number(payload.costPrice) : undefined,
    images: [featuredImageUrl, ...allGalleryUrls],
    sizes,
    notes,
    badges,
    isActive: payload.isActive !== undefined ? payload.isActive !== 'false' && payload.isActive !== false : true,
    lowStockThreshold: Number(payload.lowStockThreshold) || 5,
    metaTitle:       parseField(payload.metaTitle,       { en: '', bn: '' }),
    metaDescription: parseField(payload.metaDescription, { en: '', bn: '' }),
    faqs,
    metaKeywords: payload.metaKeywords || '',
    canonicalUrl:  payload.canonicalUrl  || '',
    socialImage:   socialImageUrl,
    robotsMeta,
  };

  const result = await ProductModel.create(doc);
  await checkAndNotifyLowStock(result);
  setImmediate(() => pingSitemapToGoogle());
  return result;
};

const updateProduct = async (id: string, payload: any, files: FileBuffers) => {
  // ── 1. Parse JSON-serialised FormData fields ──────────────────────────────
  const name        = parseField<{ en: string; bn: string } | undefined>(payload.name, undefined);
  const tagline     = parseField<{ en: string; bn: string } | undefined>(payload.tagline, undefined);
  const description = parseField<{ en: string; bn: string } | undefined>(payload.description, undefined);
  const sizes       = payload.sizes       ? parseField<any[]>(payload.sizes,  []) : undefined;
  const notes       = payload.notes       ? parseField<any>(payload.notes,    undefined) : undefined;
  const robotsMeta  = payload.robotsMeta  ? parseField<any>(payload.robotsMeta, undefined) : undefined;
  const faqs        = payload.faqs        ? parseField<any[]>(payload.faqs,  []) : undefined;
  const badges      = payload.badges      ? parseField<string[]>(payload.badges, []) : undefined;

  // ── 2. Fetch the existing document so we can merge images ─────────────────
  const existing = await ProductModel.findById(id);
  if (!existing) throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');

  // ── 3. Resolve final image arrays ─────────────────────────────────────────
  // existingFeaturedImage: client sends the current Cloudinary URL if unchanged
  let featuredImageUrl: string =
    payload.existingFeaturedImage ?? existing.images[0] ?? '';
  if (files.featuredImageBuffer) {
    const [url] = await uploadBuffers([files.featuredImageBuffer], 'subaashghor/products');
    featuredImageUrl = url;
  }

  const newGalleryUrls = await uploadBuffers(files.galleryBuffers, 'subaashghor/products');
  const existingGallery: string[] = parseField<string[]>(payload.existingGalleryImages, existing.images.slice(1));
  const allGalleryUrls = [...existingGallery, ...newGalleryUrls];

  let socialImageUrl: string = payload.socialImage ?? existing.socialImage ?? '';
  if (files.socialImageBuffer) {
    const [url] = await uploadBuffers([files.socialImageBuffer], 'subaashghor/products');
    socialImageUrl = url;
  }

  // ── 4. Build the update patch ─────────────────────────────────────────────
  const patch: Record<string, any> = {
    images: [featuredImageUrl, ...allGalleryUrls],
    socialImage: socialImageUrl,
  };

  if (name)        patch.name        = name;
  if (tagline)     patch.tagline     = tagline;
  if (description !== undefined) patch.description = description;
  if (sizes)       patch.sizes       = sizes;
  if (notes)       patch.notes       = notes;
  if (robotsMeta)  patch.robotsMeta  = robotsMeta;
  if (faqs)        patch.faqs        = faqs;
  if (badges)      patch.badges      = badges;
  if (payload.category)      patch.category      = payload.category;
  if (payload.price !== undefined) patch.price    = Number(payload.price);
  if (payload.costPrice !== undefined) patch.costPrice = Number(payload.costPrice);
  if (payload.isActive !== undefined)
    patch.isActive = payload.isActive !== 'false' && payload.isActive !== false;
  if (payload.lowStockThreshold !== undefined)
    patch.lowStockThreshold = Number(payload.lowStockThreshold);
  if (payload.metaTitle)       patch.metaTitle       = parseField(payload.metaTitle, undefined);
  if (payload.metaDescription) patch.metaDescription = parseField(payload.metaDescription, undefined);
  if (payload.metaKeywords !== undefined) patch.metaKeywords = payload.metaKeywords;
  if (payload.slug) {
    const slug = payload.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existingProductWithSlug = await ProductModel.findOne({ slug, _id: { $ne: id } });
    if (existingProductWithSlug) {
      throw new AppError(StatusCodes.CONFLICT, `A product with slug "${slug}" already exists. Use a different English name or provide a custom slug.`);
    }
    patch.slug = slug;
  }

  if (payload.canonicalUrl  !== undefined) patch.canonicalUrl  = payload.canonicalUrl;

  const result = await ProductModel.findByIdAndUpdate(id, patch, {
    new: true,
    runValidators: true,
  });

  if (!result) throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');

  await checkAndNotifyLowStock(result);
  setImmediate(() => pingSitemapToGoogle());
  return result;
};

const deleteProduct = async (id: string) => {
  const result = await ProductModel.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  }
  setImmediate(() => pingSitemapToGoogle());
  return result;
};

const parseCSV = (csvText: string) => {
  const lines = csvText.split(/\r?\n/);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const results: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.split(',').map(v => v.trim());
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = values[index];
    });
    results.push(obj);
  }
  return results;
};

const bulkUpdateProducts = async (csvText: string) => {
  const rows = parseCSV(csvText);
  let updatedCount = 0;
  
  for (const row of rows) {
    const { sku, price, saleprice, stock } = row;
    if (!sku) continue;
    
    const product = await ProductModel.findOne({ "sizes.sku": sku });
    if (!product) continue;
    
    const variant = product.sizes.find(s => s.sku === sku);
    if (!variant) continue;
    
    if (price !== undefined && price !== '') variant.price = Number(price);
    if (saleprice !== undefined) {
      variant.salePrice = saleprice === '' || saleprice === 'null' ? undefined : Number(saleprice);
    }
    if (stock !== undefined && stock !== '') variant.stock = Number(stock);
    
    await product.save();
    await checkAndNotifyLowStock(product);
    updatedCount++;
  }
  return { updatedCount };
};

const exportInventoryCSV = async () => {
  const products = await ProductModel.find({});
  const rows = [
    ['Product Name (EN)', 'Product Name (BN)', 'Category', 'SKU', 'Size (ml)', 'Price', 'Sale Price', 'Stock', 'Low Stock Threshold']
  ];
  
  for (const p of products) {
    for (const s of p.sizes) {
      rows.push([
        `"${p.name.en.replace(/"/g, '""')}"`,
        `"${p.name.bn.replace(/"/g, '""')}"`,
        p.category,
        s.sku || '',
        String(s.ml),
        String(s.price),
        String(s.salePrice || ''),
        String(s.stock),
        String(p.lowStockThreshold || 5)
      ]);
    }
  }
  
  return rows.map(r => r.join(',')).join('\n');
};

let cachedFeed: string | null = null;
let cacheTime = 0;

const generateFacebookProductFeed = async () => {
  const products = await ProductModel.find({ isActive: true });
  
  const now = Date.now();
  if (products.length > 500 && cachedFeed && (now - cacheTime) < 3600000) {
    return cachedFeed;
  }

  const storefrontUrl = (process.env.STOREFRONT_URL || 'https://project-subashghor.pages.dev').replace(/\/$/, '');

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n';
  xml += '  <channel>\n';
  xml += '    <title>Subaash Ghor Perfume Catalogue</title>\n';
  xml += `    <link>${storefrontUrl}</link>\n`;
  xml += '    <description>Facebook Product Feed for Subaash Ghor</description>\n';

  for (const product of products) {
    for (const size of product.sizes) {
      const itemId = `${product._id}-${size.ml}`;
      const title = `${product.name.en} - ${size.ml}ml`;
      const description = product.tagline.en || product.description?.en || `Premium fragrance ${product.name.en}`;
      const link = `${storefrontUrl}/products/${product.slug}?size=${size.ml}`;
      const imageLink = product.images[0] || 'https://res.cloudinary.com/demo/image/upload/v1672322312/product-oud-royale.jpg';
      const availability = size.stock > 0 ? 'in stock' : 'out of stock';
      const price = `${size.salePrice || size.price} BDT`;

      xml += '    <item>\n';
      xml += `      <g:id>${itemId}</g:id>\n`;
      xml += `      <g:title><![CDATA[${title}]]></g:title>\n`;
      xml += `      <g:description><![CDATA[${description}]]></g:description>\n`;
      xml += `      <g:link>${link}</g:link>\n`;
      xml += `      <g:image_link>${imageLink}</g:image_link>\n`;
      xml += `      <g:condition>new</g:condition>\n`;
      xml += `      <g:availability>${availability}</g:availability>\n`;
      xml += `      <g:price>${price}</g:price>\n`;
      xml += '      <g:brand>Subaash Ghor</g:brand>\n';
      xml += '      <g:google_product_category>496</g:google_product_category>\n';
      xml += '    </item>\n';
    }
  }

  xml += '  </channel>\n';
  xml += '</rss>';

  if (products.length > 500) {
    cachedFeed = xml;
    cacheTime = now;
  }

  return xml;
};

const clearCache = async () => {
  cachedFeed = null;
  cacheTime = 0;
  return { success: true };
};

export const ProductService = {
  getAllProducts,
  getFeaturedProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateProducts,
  exportInventoryCSV,
  generateFacebookProductFeed,
  clearCache,
};
