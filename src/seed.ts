import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { ProductModel } from './app/modules/Product/product.model';
import { CollectionModel } from './app/modules/Collection/collection.model';
import { PostModel } from './app/modules/Post/post.model';
import { CouponModel } from './app/modules/Coupon/coupon.model';
import { ReviewModel } from './app/modules/Review/review.model';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('DATABASE_URL is not set in environment variables');
  process.exit(1);
}

const mockProducts = [
  {
    slug: 'oud-royale',
    name: { bn: 'উদ রয়্যাল', en: 'Oud Royale' },
    tagline: { bn: 'রাজকীয় উদ এবং জাফরান', en: 'Royal Oud & Saffron' },
    images: ['https://res.cloudinary.com/demo/image/upload/v1672322312/product-oud-royale.jpg'],
    price: 6500,
    salePrice: 5500,
    badge: { bn: 'বেস্ট সেলার', en: 'Best Seller' },
    notes: {
      top: ['Saffron', 'Bergamot'],
      heart: ['Cambodian Oud', 'Rose'],
      base: ['Patchouli', 'Amber', 'Musk'],
    },
    category: 'unisex',
    collections: ['signature'],
    sizes: [
      { ml: 3, price: 1200, stock: 20 },
      { ml: 12, price: 3200, stock: 12 },
      { ml: 50, price: 6500, salePrice: 5500, stock: 8 },
      { ml: 100, price: 11500, stock: 3 },
    ],
    rating: 4.8,
    reviewCount: 2,
    isActive: true,
  },
  {
    slug: 'rose-musk',
    name: { bn: 'রোজ মাস্ক', en: 'Rose Musk' },
    tagline: { bn: 'দামাস্ক রোজ ও সাদা মাস্ক', en: 'Damask Rose & White Musk' },
    images: ['https://res.cloudinary.com/demo/image/upload/v1672322312/product-rose-musk.jpg'],
    price: 4200,
    badge: { bn: 'নতুন', en: 'New' },
    notes: {
      top: ['Damask Rose', 'Pink Pepper'],
      heart: ['Turkish Rose', 'Jasmine'],
      base: ['White Musk', 'Sandalwood'],
    },
    category: 'women',
    collections: ['floral'],
    sizes: [
      { ml: 12, price: 2200, stock: 15 },
      { ml: 50, price: 4200, stock: 10 },
    ],
    rating: 4.6,
    reviewCount: 0,
    isActive: true,
  },
  {
    slug: 'midnight-saffron',
    name: { bn: 'মিডনাইট জাফরান', en: 'Midnight Saffron' },
    tagline: { bn: 'জাফরান ও অ্যাম্বার', en: 'Saffron & Amber' },
    images: ['https://res.cloudinary.com/demo/image/upload/v1672322312/product-midnight-saffron.jpg'],
    price: 8500,
    notes: {
      top: ['Saffron', 'Cardamom'],
      heart: ['Oud', 'Praline'],
      base: ['Vanilla', 'Amber'],
    },
    category: 'men',
    collections: ['signature'],
    sizes: [
      { ml: 30, price: 5200, stock: 6 },
      { ml: 50, price: 8500, stock: 4 },
      { ml: 100, price: 14500, stock: 2 },
    ],
    rating: 4.9,
    reviewCount: 0,
    isActive: true,
  },
  {
    slug: 'jasmine-noir',
    name: { bn: 'জেসমিন নয়ার', en: 'Jasmine Noir' },
    tagline: { bn: 'মিস্টি জেসমিন ও ভ্যানিলা', en: 'Mystic Jasmine & Vanilla' },
    images: ['https://res.cloudinary.com/demo/image/upload/v1672322312/product-jasmine-noir.jpg'],
    price: 3800,
    notes: {
      top: ['Bergamot', 'Jasmine Petals'],
      heart: ['Sambac Jasmine', 'Tuberose'],
      base: ['Vanilla', 'Cedar'],
    },
    category: 'women',
    collections: ['floral'],
    sizes: [
      { ml: 30, price: 2500, stock: 10 },
      { ml: 50, price: 3800, stock: 7 },
    ],
    rating: 4.7,
    reviewCount: 0,
    isActive: true,
  },
];

const mockCollections = [
  {
    slug: 'signature',
    name: { bn: 'স্বাক্ষর সংগ্রহ', en: 'Signature Collection' },
    description: {
      bn: 'আমাদের সবচেয়ে আইকনিক সুবাস।',
      en: 'Our most iconic fragrances.',
    },
    cover: 'https://res.cloudinary.com/demo/image/upload/v1672322312/product-oud-royale.jpg',
    order: 1,
    isActive: true,
  },
  {
    slug: 'floral',
    name: { bn: 'ফুলেল সিরিজ', en: 'Floral Series' },
    description: {
      bn: 'ফুলের কোমলতা ও গভীরতা।',
      en: 'The softness and depth of blooms.',
    },
    cover: 'https://res.cloudinary.com/demo/image/upload/v1672322312/product-rose-musk.jpg',
    order: 2,
    isActive: true,
  },
];

const mockPosts = [
  {
    slug: 'art-of-attar',
    title: { bn: 'আতরের শিল্প: একটি প্রাচীন ঐতিহ্য', en: 'The Art of Attar: An Ancient Tradition' },
    excerpt: {
      bn: 'শতাব্দীর পুরনো পদ্ধতিতে কীভাবে আতর তৈরি হয়।',
      en: 'Discover how attars are crafted using centuries-old methods.',
    },
    content: {
      bn: '# আতরের শিল্প\nআতরের একটি সমৃদ্ধ ইতিহাস রয়েছে...',
      en: '# The Art of Attar\nAttars have a rich, complex history...',
    },
    category: { bn: 'ঐতিহ্য', en: 'Heritage' },
    cover: 'https://res.cloudinary.com/demo/image/upload/v1672322312/blog-1.jpg',
    date: new Date('2025-04-12'),
    featured: true,
    published: true,
  },
  {
    slug: 'choosing-summer-scent',
    title: { bn: 'গ্রীষ্মের জন্য সঠিক সুবাস বাছাই', en: 'How to Choose a Summer Scent' },
    excerpt: {
      bn: 'গরম আবহাওয়ার জন্য হালকা ও তরতাজা সুগন্ধির গাইড।',
      en: 'A guide to light, fresh fragrances for warm weather.',
    },
    content: {
      bn: '# সঠিক সুবাস বাছাই\nগ্রীষ্মকালে আমাদের হালকা গন্ধ ভালো লাগে...',
      en: '# Choosing a Summer Scent\nSummer heat demands fresh compositions...',
    },
    category: { bn: 'টিপস', en: 'Fragrance Tips' },
    cover: 'https://res.cloudinary.com/demo/image/upload/v1672322312/blog-3.jpg',
    date: new Date('2025-04-05'),
    featured: false,
    published: true,
  },
  {
    slug: 'oud-explained',
    title: { bn: "উদ: কেন এটি 'তরল সোনা'", en: "Oud Explained: Why It's 'Liquid Gold'" },
    excerpt: {
      bn: 'আগরউড থেকে উদ পর্যন্ত — একটি বিরল সম্পদের যাত্রা।',
      en: 'From agarwood to oud — the journey of a rare treasure.',
    },
    content: {
      bn: '# উদ কি?\nউদ হল প্রকৃতির সবচেয়ে দামী সুগন্ধি উপাদান...',
      en: '# What is Oud?\nOud is one of the most expensive raw materials...',
    },
    category: { bn: 'সুবাস ইতিহাস', en: 'Scent History' },
    cover: 'https://res.cloudinary.com/demo/image/upload/v1672322312/blog-2.jpg',
    date: new Date('2025-03-28'),
    featured: false,
    published: true,
  },
];

const mockCoupons = [
  { code: 'WELCOME10', type: 'percent', value: 10, minSubtotal: 2000, active: true },
  { code: 'FREESHIP', type: 'flat', value: 130, minSubtotal: 1500, active: true },
];

const seed = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(dbUrl);
    console.log('Connected!');

    // Clean existing
    console.log('Cleaning collections...');
    await ProductModel.deleteMany({});
    await CollectionModel.deleteMany({});
    await PostModel.deleteMany({});
    await CouponModel.deleteMany({});
    await ReviewModel.deleteMany({});

    console.log('Inserting collections...');
    await CollectionModel.insertMany(mockCollections);

    console.log('Inserting products...');
    const insertedProducts = await ProductModel.insertMany(mockProducts);

    console.log('Inserting posts...');
    await PostModel.insertMany(mockPosts);

    console.log('Inserting coupons...');
    await CouponModel.insertMany(mockCoupons);

    // Seed some mock reviews
    console.log('Inserting reviews...');
    const oudRoyaleProduct = insertedProducts.find((p) => p.slug === 'oud-royale');
    if (oudRoyaleProduct) {
      const dummyUserId = new mongoose.Types.ObjectId();
      await ReviewModel.create([
        {
          productId: oudRoyaleProduct._id,
          productSlug: 'oud-royale',
          userId: dummyUserId,
          userName: 'Ayesha R.',
          userLocation: 'Dhaka',
          rating: 5,
          title: 'Heavenly',
          body: 'Long-lasting and luxurious — the saffron opening is unreal.',
          status: 'published',
          featured: true,
        },
        {
          productId: oudRoyaleProduct._id,
          productSlug: 'oud-royale',
          userId: new mongoose.Types.ObjectId(),
          userName: 'Rakib H.',
          userLocation: 'Chattogram',
          rating: 5,
          body: 'My signature scent now. Compliments every time I wear it.',
          status: 'published',
          featured: false,
        },
      ]);
    }

    console.log('Database seeded successfully! 🎉');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
