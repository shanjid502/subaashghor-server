import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { ProductModel } from './product.model';
import { checkAndNotifyLowStock } from '../../utils/stockNotifier';
import { pingSitemapToGoogle } from '../../utils/sitemapGenerator';

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
  if (isAdmin !== 'true') {
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

  const products = await productsQuery;
  const total = await ProductModel.countDocuments(filterObj);

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

const getFeaturedProducts = async () => {
  const featured = await ProductModel.find({ isActive: true }).limit(8);
  return featured;
};

const getProductBySlug = async (slug: string) => {
  const product = await ProductModel.findOne({ slug });
  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  }
  return product;
};

const createProduct = async (payload: any) => {
  // If slug is not provided, generate from English name
  if (!payload.slug && payload.name?.en) {
    payload.slug = payload.name.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  const existingProduct = await ProductModel.findOne({ slug: payload.slug });
  if (existingProduct) {
    throw new AppError(StatusCodes.CONFLICT, 'Product with this slug already exists');
  }

  const result = await ProductModel.create(payload);
  await checkAndNotifyLowStock(result);
  setImmediate(() => pingSitemapToGoogle());
  return result;
};

const updateProduct = async (id: string, payload: any) => {
  const result = await ProductModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  }

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
