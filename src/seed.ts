import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

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
    images: [
      'https://res.cloudinary.com/rc3ghq9c/image/upload/f_auto,q_auto/v1785153637/subaashghor/products/product-oud-royale.jpg',
    ],
    price: 6500,
    salePrice: 5500,
    badge: { bn: 'বেস্ট সেলার', en: 'Best Seller' },
    notes: {
      top: [{ name: 'Saffron' }, { name: 'Bergamot' }],
      heart: [{ name: 'Cambodian Oud' }, { name: 'Rose' }],
      base: [{ name: 'Patchouli' }, { name: 'Amber' }, { name: 'Musk' }],
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
    images: [
      'https://res.cloudinary.com/rc3ghq9c/image/upload/f_auto,q_auto/v1785153638/subaashghor/products/product-rose-musk.jpg',
    ],
    price: 4200,
    badge: { bn: 'নতুন', en: 'New' },
    notes: {
      top: [{ name: 'Damask Rose' }, { name: 'Pink Pepper' }],
      heart: [{ name: 'Turkish Rose' }, { name: 'Jasmine' }],
      base: [{ name: 'White Musk' }, { name: 'Sandalwood' }],
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
    images: [
      'https://res.cloudinary.com/rc3ghq9c/image/upload/f_auto,q_auto/v1785153640/subaashghor/products/product-midnight-saffron.jpg',
    ],
    price: 8500,
    notes: {
      top: [{ name: 'Saffron' }, { name: 'Cardamom' }],
      heart: [{ name: 'Oud' }, { name: 'Praline' }],
      base: [{ name: 'Vanilla' }, { name: 'Amber' }],
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
    images: [
      'https://res.cloudinary.com/rc3ghq9c/image/upload/f_auto,q_auto/v1785153641/subaashghor/products/product-jasmine-noir.jpg',
    ],
    price: 3800,
    notes: {
      top: [{ name: 'Bergamot' }, { name: 'Jasmine Petals' }],
      heart: [{ name: 'Sambac Jasmine' }, { name: 'Tuberose' }],
      base: [{ name: 'Vanilla' }, { name: 'Cedar' }],
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
    cover:
      'https://res.cloudinary.com/rc3ghq9c/image/upload/f_auto,q_auto/v1785153637/subaashghor/products/product-oud-royale.jpg',
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
    cover:
      'https://res.cloudinary.com/rc3ghq9c/image/upload/f_auto,q_auto/v1785153638/subaashghor/products/product-rose-musk.jpg',
    order: 2,
    isActive: true,
  },
];

const mockPosts = [
  {
    slug: 'alchemy-of-pure-cambodian-oud',
    title: {
      bn: 'খাঁটি কম্বোডিয়ান উদ ও জাফরানের রসায়ন: সুবাসঘরের রাজকীয় ঐতিহ্য',
      en: 'The Alchemy of Pure Cambodian Oud & Saffron: Subaashghor Heritage',
    },
    excerpt: {
      bn: 'কীভাবে প্রাচীন আগর কাঠ এবং প্রিমিয়াম জাফরান একত্রিত হয়ে তৈরি করে পৃথিবীর সবচেয়ে বিলাসবহুল সুবাস। পড়ুন আমাদের গভীর অনুসন্ধান।',
      en: 'Discover how century-old Cambodian agarwood and hand-picked Kashmiri saffron forge one of the world’s most coveted luxury attars.',
    },
    content: {
      en: `<h2>The Golden Resin of Koh Kong: Pure Cambodian Oud</h2>
<p>In the mist-shrouded forests of Koh Kong, aged Aquilaria trees undergo a decades-long natural transformation to yield one of perfumery’s most sacred resins — pure Cambodian Oud. Unlike modern synthetic imitations, authentic attar distillation requires patience, reverence, and master craftsmanship.</p>

<p>At Subaashghor, our signature blend starts with wild-harvested agarwood soaked in pristine spring water before undergoing copper distillation in traditional <em>Deg-Bhapka</em> stills. The resulting oil possesses a deep, balsamic, leather-sweet aroma that deepens gracefully on skin for over 24 hours.</p>

<blockquote>"True Cambodian Oud does not merely sit on your skin; it evolves with your body heat, revealing layers of honeyed wood, warm spices, and smoky amber."</blockquote>

<h2>Infusing the Spice of Royalty: Kashmiri Saffron</h2>
<p>To complement the deep, earthy undertones of raw Cambodian Oud, our perfumers introduce hand-extracted Kashmiri Saffron top notes. This delicate crimson spice adds a regal, bittersweet opening note that captivates from the first drop.</p>

<p>If you are seeking the pinnacle of luxury attar blending, explore our flagship creation: <a href="/products/oud-royale" style="color:#d4af37; font-weight:600;">Oud Royale Attar</a>, or discover its intense evening counterpart, <a href="/products/midnight-saffron" style="color:#d4af37; font-weight:600;">Midnight Saffron</a>.</p>

<h2>How to Experience Oud Royale</h2>
<ul>
  <li>Apply a single drop to your wrist pulse points after a warm shower.</li>
  <li>Avoid rubbing your wrists together — allow the oil to dry naturally to preserve top notes.</li>
  <li>Pair with dark velvet or cotton attire for maximum sillage longevity.</li>
</ul>
<p>Explore our complete <a href="/shop" style="color:#d4af37; font-weight:600;">Subaashghor Storefront Collection</a> or take our interactive <a href="/scent-finder" style="color:#d4af37; font-weight:600;">Scent Finder Quiz</a> to find your personal signature fragrance.</p>`,

      bn: `<h2>কোহ কংয়ের স্বর্ণালী রেজিন: খাঁটি কম্বোডিয়ান উদ</h2>
<p>কম্বোডিয়ার কোহ কংয়ের কুয়াশাচ্ছন্ন বনে বহু বছরের প্রাকৃতিক প্রক্রিয়ায় অ্যাকুইলারিয়া গাছ থেকে উৎপন্ন হয় সুগন্ধি জগতের অন্যতম পবিত্র উপাদান — খাঁটি কম্বোডিয়ান উদ। আধুনিক কৃত্রিম সুগন্ধির যুগে আসল আতরের পাতন প্রক্রিয়ার জন্য প্রয়োজন ধৈর্য এবং বংশানুক্রমিক কারিগরি দক্ষতা।</p>

<p>সুবাসঘরে আমাদের সিগনেচার সুবাসের মূল ভিত্তি হলো প্রাকৃতিক আগর কাঠ, যা তামা ও মাটির প্রথাগত <em>দেগ-ভপকা</em> পাত্রে মৃদু তাপে পাতন করা হয়। এই তেল থেকে আসে এক গাঢ়, মিষ্টি কাঠের সুবাস যা ত্বকে ২৪ ঘণ্টারও বেশি সময় স্থায়ী হয়।</p>

<blockquote>"আসল কম্বোডিয়ান উদ কেবল ত্বকে স্থায়ী হয় না; এটি শরীরের তাপমাত্রার সাথে সাথে পরিবর্তিত হয়ে মধু, উষ্ণ মশলা ও অ্যাম্বারের চমৎকার স্তর উন্মোচন করে।"</blockquote>

<h2>রাজকীয় মশলার স্পর্শ: কাশ্মীরি জাফরান</h2>
<p>কম্বোডিয়ান উদ-এর গভীর মাটির সুবাসের সাথে সামঞ্জস্য রাখতে আমাদের সুগন্ধি কারিগররা যোগ করেছেন হাত দিয়ে সংগৃহীত কাশ্মীরি জাফরান। এই দুর্লভ লাল মশলা সুবাসের শুরুতে এক রাজকীয় ও মৃদু মিষ্টি ছোঁয়া এনে দেয়।</p>

<p>আপনি যদি রাজকীয় উদ আতরের সর্বোচ্চ অভিজ্ঞতা চান, তবে আমাদের ফ্ল্যাগশিপ কালেকশন <a href="/products/oud-royale" style="color:#d4af37; font-weight:600;">উদ রয়্যাল (Oud Royale)</a> দেখুন, অথবা সান্ধ্যকালীন ব্যবহারের জন্য <a href="/products/midnight-saffron" style="color:#d4af37; font-weight:600;">মিডনাইট জাফরান (Midnight Saffron)</a> সংগ্রহ করুন।</p>

<h2>উদ রয়্যাল ব্যবহারের সঠিক নিয়ম</h2>
<ul>
  <li>উষ্ণ গোসলের পর কবজির পালস পয়েন্টে মাত্র এক ফোটা প্রয়োগ করুন।</li>
  <li>দুই কবজি একসাথে ঘষবেন না — সুবাসের শীর্ষ নোট অক্ষত রাখতে প্রাকৃতিক বাতাসে শুকাতে দিন।</li>
  <li>দীর্ঘস্থায়ী সুবাসের জন্য সুতি বা খাদি কাপড়ের সাথে ব্যবহার করুন।</li>
</ul>
<p>আমাদের সম্পূর্ণ সুবাস দেখতে ভিজিট করুন <a href="/shop" style="color:#d4af37; font-weight:600;">সুবাসঘর শপ</a> অথবা আপনার জন্য সঠিক পারফিউম বেছে নিতে ট্রাই করুন <a href="/scent-finder" style="color:#d4af37; font-weight:600;">সেন্ট ফাইন্ডার কুয়িজ</a>।</p>`,
    },
    category: { bn: 'ঐতিহ্য', en: 'Heritage' },
    cover:
      'https://res.cloudinary.com/rc3ghq9c/image/upload/f_auto,q_auto/v1785147784/subaashghor/blog/iv5vh31rr7hgdgxnwqhw.jpg',
    coverAlt:
      'Luxury glass attar flacon with raw Cambodian agarwood chips and saffron threads',
    date: new Date('2026-07-20'),
    readMinutes: 6,
    featured: true,
    published: true,
    author: {
      name: 'Subaashghor Editorial Team',
      avatarUrl:
        'https://res.cloudinary.com/rc3ghq9c/image/upload/v1672322312/subaashghor/author-avatar.jpg',
    },
    metaTitle: {
      bn: 'কম্বোডিয়ান উদ ও জাফরানের ইতিহাস ও ব্যবহার গাইড | সুবাসঘর',
      en: 'The Alchemy of Pure Cambodian Oud & Saffron | Subaashghor',
    },
    metaDescription: {
      bn: 'জানুন কীভাবে কম্বোডিয়ান আগর কাঠ ও কাশ্মীরি জাফরান দিয়ে প্রিমিয়াম আতর তৈরি হয়। পড়ুন সুবাসঘরের ঐতিহ্যভিত্তিক গাইড।',
      en: 'Discover how century-old Cambodian agarwood and Kashmiri saffron forge luxury attars. Read the definitive fragrance guide by Subaashghor.',
    },
    metaKeywords:
      'cambodian oud, kashmiri saffron, attar bangladesh, luxury perfume, subaashghor, oud royale',
    canonicalUrl: 'https://subaashghor.com/blog/alchemy-of-pure-cambodian-oud',
    socialImage:
      'https://res.cloudinary.com/rc3ghq9c/image/upload/f_auto,q_auto/v1785147784/subaashghor/blog/iv5vh31rr7hgdgxnwqhw.jpg',
    robotsMeta: {
      noindex: false,
      nofollow: false,
      noarchive: false,
    },
    faqs: [
      {
        question: {
          bn: 'কম্বোডিয়ান উদ এত দামি কেন?',
          en: 'Why is Cambodian Oud considered so valuable?',
        },
        answer: {
          bn: 'প্রাকৃতিক অ্যাকুইলারিয়া গাছে আগর কাঠ তৈরি হতে বহু দশক সময় লাগে। এটি অত্যন্ত বিরল এবং এর সমৃদ্ধ সুবাস কৃত্রিমভাবে তৈরি করা অসম্ভব।',
          en: 'Wild Cambodian agarwood takes decades to form inside mature Aquilaria trees. Its resin yield is extremely scarce and impossible to replicate synthetically.',
        },
      },
      {
        question: {
          bn: 'উদ রয়্যাল আতর কতক্ষণ স্থায়ী হয়?',
          en: 'How long does Oud Royale attar stay on skin and clothes?',
        },
        answer: {
          bn: 'ত্বকে এটি ১২-১৮ ঘণ্টা এবং সুতি কাপড়ে ২৪ ঘণ্টারও বেশি সময় ধরে স্পষ্ট সুবাস ছড়ায়।',
          en: 'On human skin, it lasts 12-18 hours, while on natural fabrics like cotton or velvet, it maintains sillage for over 24 hours.',
        },
      },
    ],
  },
  {
    slug: 'damask-rose-and-white-musk-sillage',
    title: {
      bn: 'দামাস্ক গোলাপ ও সাদা মাস্ক: গ্রীষ্মকালীন ফ্রেশ সুবাসের সিক্রেট',
      en: 'Damask Rose & White Musk: Crafting Eternal Summer Sillage',
    },
    excerpt: {
      bn: 'গ্রীষ্মের গরমেও যেভাবে সুবাসকে তাজা ও আকর্ষণীয় রাখবেন। জানুন দামাস্ক গোলাপ ও মাস্কের নিখুঁত রসায়ন।',
      en: 'Unveil the secrets of blending fresh Damask rose with velvety white musk for a radiant, long-lasting summer fragrance profile.',
    },
    content: {
      en: `<h2>The Morning Harvest of Rosa Damascena</h2>
<p>Few flowers carry the romantic allure of the Damask Rose. Cultivated in high-altitude valley gardens, these roses must be hand-picked in the early dawn hours before the sun evaporates their volatile essential oils. It takes over 4,000 kilograms of freshly harvested petals to yield a single kilogram of pure rose otto oil.</p>

<h2>Why White Musk is the Ultimate Fragrance Fixative</h2>
<p>While fresh rose notes tend to dissipate quickly in warm tropical humidity, blending them with velvet-soft White Musk creates a protective aromatic anchor. Musk molecules bind tightly to lipid layers on your skin, slowing down evaporation and allowing the floral heart notes to bloom effortlessly for hours.</p>

<p>Experience this timeless floral alchemy with our highly praised <a href="/products/rose-musk" style="color:#d4af37; font-weight:600;">Rose Musk Attar</a> or explore our night-blooming jasmine creation, <a href="/products/jasmine-noir" style="color:#d4af37; font-weight:600;">Jasmine Noir</a>.</p>

<h2>3 Layering Tips for Tropical Weather</h2>
<ol>
  <li><strong>Hydrate First:</strong> Apply a light unscented moisturizer to pulse points before dabbing your attar. Dry skin absorbs fragrant oils too quickly.</li>
  <li><strong>Focus on Warm Areas:</strong> Dab behind the earlobes, base of the neck, and inner elbows.</li>
  <li><strong>Combine Floral & Woody:</strong> Layer a drop of Rose Musk over a woody base like Oud Royale for a custom signature scent.</li>
</ol>

<p>Need personalized recommendation based on your lifestyle? Use our <a href="/scent-finder" style="color:#d4af37; font-weight:600;">Subaashghor Scent Finder</a> to discover fragrances tailored to your preference.</p>`,

      bn: `<h2>দামাস্ক গোলাপের ভোরের আহরণ</h2>
<p>গোলাপের সুবাসের রাজ্যে দামাস্ক গোলাপের আবেদন অতুলনীয়। পাহাড়ি উপত্যকার বাগানে ভোরে সূর্য ওঠার আগেই এই গোলাপ তুলে নেওয়া হয়, যাতে রোদের তাপে সুগন্ধি তেল শুকিয়ে না যায়। এক কেজি খাঁটি রোজ অটো অয়েল পেতে প্রায় ৪,০০০ কেজি সতেজ গোলাপের পাপড়ি প্রয়োজন হয়।</p>

<h2>সাদা মাস্ক কেন সবচেয়ে সেরা সুবাস ফিক্সেটিভ?</h2>
<p>গ্রীষ্মের আবহাওয়ায় হালকা ফুলের গন্ধ দ্রুত বাতাসে মিলিয়ে যেতে পারে। কিন্তু সাদা মাস্কের সাথে দামাস্ক গোলাপ যুক্ত করলে মাস্কের অনু ত্বকের সাঙ্গে শক্তভাবে আবদ্ধ হয়। এটি বাষ্পীভবনের গতি কমিয়ে দেয়, ফলে সুবাস ঘণ্টার পর ঘণ্টা তাজা থাকে।</p>

<p>আমাদের বিশেষ সমাদৃত <a href="/products/rose-musk" style="color:#d4af37; font-weight:600;">রোজ মাস্ক (Rose Musk Attar)</a> ট্রাই করুন অথবা উপভোগ করুন রজনীগন্ধা ও জেসমিনের মিশ্রণ <a href="/products/jasmine-noir" style="color:#d4af37; font-weight:600;">জেসমিন নয়ার (Jasmine Noir)</a>।</p>

<h2>গ্রীষ্মে সুবাস দীর্ঘস্থায়ী করার ৩টি গোপন টিপস</h2>
<ol>
  <li><strong>ত্বক মশ্চারাইজ করুন:</strong> আতর ব্যবহারের আগে পালস পয়েন্টে আনসেন্টেড লোশন লাগান। শুষ্ক ত্বক তেল দ্রুত শুষে নেয়।</li>
  <li><strong>সঠিক পয়েন্ট নির্বাচন:</strong> কানের পেছনে, ঘাড়ের নিচে এবং কনুইয়ের ভাঁজে আতর ছোঁয়ান।</li>
  <li><strong>লেয়ারিং করুন:</strong> রোজ মাস্কের সাথে সামান্য উদ মিশিয়ে নিজের জন্য একটি নতুন ও নিজস্ব সিগনেচার সুবাস তৈরি করুন।</li>
</ol>

<p>আপনার জন্য সঠিক পারফিউম নির্বাচনে সহায়তা পেতে দেখুন <a href="/scent-finder" style="color:#d4af37; font-weight:600;">সেন্ট ফাইন্ডার গাইড</a>।</p>`,
    },
    category: { bn: 'সুগন্ধি গাইড', en: 'Fragrance Guide' },
    cover:
      'https://res.cloudinary.com/rc3ghq9c/image/upload/f_auto,q_auto/v1785147806/subaashghor/blog/sh5rwexj4bwgrrukeoi9.jpg',
    coverAlt:
      'Artisanal perfume glass bottle surrounded by blooming Damask roses and white petals',
    date: new Date('2026-07-15'),
    readMinutes: 5,
    featured: false,
    published: true,
    author: {
      name: 'Subaashghor Editorial Team',
      avatarUrl:
        'https://res.cloudinary.com/rc3ghq9c/image/upload/v1672322312/subaashghor/author-avatar.jpg',
    },
    metaTitle: {
      bn: 'দামাস্ক গোলাপ ও সাদা মাস্কের নিখুঁত সুবাস গাইড | সুবাসঘর',
      en: 'Damask Rose & White Musk Sillage Masterclass | Subaashghor',
    },
    metaDescription: {
      bn: 'গ্রীষ্মের তাপদাহেও কীভাবে আতরের তাজা ভাব দীর্ঘস্থায়ী করবেন। জানুন দামাস্ক গোলাপ ও মাস্কের ব্যবহার পদ্ধতি।',
      en: 'Learn how to wear Damask Rose and White Musk attars in tropical weather. A fragrance layering guide by Subaashghor.',
    },
    metaKeywords:
      'damask rose attar, white musk bangladesh, summer perfumes, rose musk subaashghor',
    canonicalUrl:
      'https://subaashghor.com/blog/damask-rose-and-white-musk-sillage',
    socialImage:
      'https://res.cloudinary.com/rc3ghq9c/image/upload/f_auto,q_auto/v1785147806/subaashghor/blog/sh5rwexj4bwgrrukeoi9.jpg',
    robotsMeta: {
      noindex: false,
      nofollow: false,
      noarchive: false,
    },
    faqs: [
      {
        question: {
          bn: 'সাদা মাস্ক কি পুরুষ ও নারী উভয়ই ব্যবহার করতে পারেন?',
          en: 'Is Rose Musk suitable for both men and women?',
        },
        answer: {
          bn: 'হ্যাঁ, এটি একটি অত্যন্ত ভারসাম্যপূর্ণ ইউনিসেক্স সুবাস। মাস্কের মৃদু মাটির ছোঁয়া এটিকে পুরুষ ও নারী উভয়ের জন্য উপযোগী করে তোলে।',
          en: 'Yes, Rose Musk is a well-balanced floral-musk profile that wears elegantly on both men and women.',
        },
      },
    ],
  },
  {
    slug: 'attar-longevity-masterclass-tropical-weather',
    title: {
      bn: 'মাস্টার ক্লাস: ট্রপিক্যাল আবহাওয়ায় আতরের স্থায়িত্ব বাড়ানোর ৫টি টেকনিক',
      en: 'Master Class: 5 Secret Techniques to Make Attar Last All Day',
    },
    excerpt: {
      bn: 'বাংলাদেশের আদ্র ও গরম আবহাওয়ায় কীভাবে আপনার প্রিয় পারফিউম ও আতর সারাদিন লাস্টিং করাবেন? পড়ুন বিশেষজ্ঞ পরামর্শ।',
      en: 'Expert secrets to maximizing sillage and projection in high heat and humidity. Master the art of pulse-point oil application.',
    },
    content: {
      en: `<h2>1. The Hydration Shield (Lotion Anchor)</h2>
<p>Fragrance molecules evaporate significantly faster from dry skin. Before applying concentrated attar oils like <a href="/products/oud-royale" style="color:#d4af37; font-weight:600;">Oud Royale</a> or <a href="/products/midnight-saffron" style="color:#d4af37; font-weight:600;">Midnight Saffron</a>, massage a small quantity of unscented body oil or shea butter onto your pulse points. The oil lipids lock in the scent notes, doubling their longevity.</p>

<h2>2. Targeted Pulse Point Mapping</h2>
<p>Heat drives fragrance projection. Focus your application on blood-vessel rich zones:</p>
<ul>
  <li>Carotid arteries on sides of the neck.</li>
  <li>Inner wrists (dab, never rub).</li>
  <li>Behind knee joints and chest area for subtle upward wafts throughout the day.</li>
</ul>

<h2>3. Fabric Application for Extended Sillage</h2>
<p>While alcohol-based perfumes can stain delicate silks, pure non-alcoholic attars can be applied onto inner garment hems, collars, and cuffs. Natural fibers like Punjabi cotton, linen, and wool retain pure oil notes for several days without degradation.</p>

<h2>4. Proper Storage Away from Sunlight & Heat</h2>
<p>Never leave your attar bottles on sunny windowsills or in humid bathrooms. UV light and temperature fluctuations break down delicate natural aromatic esters. Store your bottles inside dark velvet boxes or wooden chests at room temperature.</p>

<p>Check out our complete handcrafted collection at the <a href="/shop" style="color:#d4af37; font-weight:600;">Subaashghor Official Shop</a> or get tailored advice via our <a href="/contact" style="color:#d4af37; font-weight:600;">Fragrance Support Team</a>.</p>`,

      bn: `<h2>১. মশ্চারাইজিং শিল্ড (লোশন অ্যান্কর)</h2>
<p>শুষ্ক ত্বক থেকে সুগন্ধির অনু খুব দ্রুত বাতাসে উবে যায়। <a href="/products/oud-royale" style="color:#d4af37; font-weight:600;">উদ রয়্যাল (Oud Royale)</a> বা <a href="/products/midnight-saffron" style="color:#d4af37; font-weight:600;">মিডনাইট জাফরান (Midnight Saffron)</a> এর মতো আতর ব্যবহারের আগে আপনার পালস পয়েন্টে আনসেন্টেড বডি লোশন বা পেট্রোলিয়াম জেলি হালকা করে লাগিয়ে নিন। এটি আতরের স্থায়িত্ব দ্বিগুণ করে দেয়।</p>

<h2>২. সঠিক পালস পয়েন্টে ব্যবহার</h2>
<p>শরীরের উত্তাপ সুবাস ছড়াতে সাহায্য করে। তাই রক্তনালী সমৃদ্ধ পয়েন্টগুলোতে আতর ব্যবহার করুন:</p>
<ul>
  <li>ঘাড়ের দুই পাশে ও কানের পেছনে।</li>
  <li>কবজির ভেতরের অংশে (হালকা ছোঁয়ান, কখনও ঘষবেন না)।</li>
  <li>বুকের মাঝখানে ও জামার কলারের ভেতরের অংশে।</li>
</ul>

<h2>৩. কাপড়ে আতরের সঠিক ব্যবহার</h2>
<p>অ্যালকোহলযুক্ত পারফিউম কাপড়ে দাগ ফেলতে পারে, কিন্তু খাঁটি নন-অ্যালকোহলিক আতর সুতি পাঞ্জাবি, লিনেন বা খাদি কাপড়ের কলার ও হাতার ভেতরে ছোঁয়ালে সুবাস ২-৩ দিন পর্যন্ত সতেজ থাকে।</p>

<h2>৪. আলো ও তাপ থেকে দূরে সংরক্ষণ</h2>
<p>আতর বা পারফিউম কখনোই সরাসরি রোদে বা বাথরুমের ভেজা পরিবেশে রাখবেন না। সূর্যের অতিবেগুনী রশ্মি তেলের প্রাকৃতিক রাসায়নিক গঠন নষ্ট করে দেয়। ঘরের স্বাভাবিক তাপমাত্রায় ডার্ক বক্সে রাখুন।</p>

<p>আমাদের সকল অরিজিনাল কালেকশন দেখতে ভিজিট করুন <a href="/shop" style="color:#d4af37; font-weight:600;">সুবাসঘর অফিসিয়াল শপ</a> অথবা যেকোনো সহায়তার জন্য আমাদের <a href="/contact" style="color:#d4af37; font-weight:600;">সুবাসঘর কনসিয়ার্জ টিম</a> এর সাথে যোগাযোগ করুন।</p>`,
    },
    category: { bn: 'টিপস ও যত্ন', en: 'Tips & Care' },
    cover:
      'https://res.cloudinary.com/rc3ghq9c/image/upload/f_auto,q_auto/v1785147809/subaashghor/blog/wtidg9pdpzeffixnzrai.jpg',
    coverAlt:
      'Macro photograph of a drop of golden attar oil being applied to wrist with glass applicator wand',
    date: new Date('2026-07-10'),
    readMinutes: 7,
    featured: true,
    published: true,
    author: {
      name: 'Subaashghor Editorial Team',
      avatarUrl:
        'https://res.cloudinary.com/rc3ghq9c/image/upload/v1672322312/subaashghor/author-avatar.jpg',
    },
    metaTitle: {
      bn: 'বাংলাদেশে আতরের স্থায়িত্ব বাড়ানোর ৫টি কার্যকরী কৌশল | সুবাসঘর',
      en: '5 Master Techniques to Make Attar Last All Day | Subaashghor',
    },
    metaDescription: {
      bn: 'গরম ও আদ্র আবহাওয়ায় আতরের পারফরম্যান্স ও স্থায়িত্ব বাড়ানোর মাস্টার ক্লাস গাইড। পড়ুন সুবাসঘর পারফিউম টিপস।',
      en: 'Master class guide on making non-alcoholic attars and perfumes last all day in high humidity. Read Subaashghor tips.',
    },
    metaKeywords:
      'attar application tips, perfume longevity bangladesh, how to apply attar, subaashghor tips',
    canonicalUrl:
      'https://subaashghor.com/blog/attar-longevity-masterclass-tropical-weather',
    socialImage:
      'https://res.cloudinary.com/rc3ghq9c/image/upload/f_auto,q_auto/v1785147809/subaashghor/blog/wtidg9pdpzeffixnzrai.jpg',
    robotsMeta: {
      noindex: false,
      nofollow: false,
      noarchive: false,
    },
    faqs: [
      {
        question: {
          bn: 'আতর কি সুতি কাপড়ে দাগ ফেলে?',
          en: 'Does pure attar oil leave permanent stains on clothes?',
        },
        answer: {
          bn: 'হালকা রঙা জামায় সরাসরি তেল ঢাললে সামান্য ছোপ পড়তে পারে। তাই কাপড়ের ভেতরের কলার ও সেলাইয়ের অংশে ছোঁয়ানো নিরাপদ।',
          en: 'Applying concentrated oil directly onto light white fabric may leave faint oil rings. Apply onto inner collars, sleeve seams, or pre-blend on skin.',
        },
      },
    ],
  },
  {
    slug: 'artisan-distillation-behind-the-scenes',
    title: {
      bn: 'পর্দার আড়ালে: ঐতিহ্যবাহী তামা পাত্রে সুবাসঘরের প্রথাগত আতর পাতন',
      en: 'Behind the Scenes: Traditional Copper Deg-Bhapka Distillation',
    },
    excerpt: {
      bn: 'সুবাসঘরের বিশেষ পাতন কারখানায় এক নজর — যেখানে কাঠকয়লার আগুনে তৈরি হয় শতাব্দীর সেরা প্রাকৃতিক নির্যাস।',
      en: 'Take a rare look inside our artisanal copper alembic distillery where wood-fire heat and mountain spring water extract pure natural oils.',
    },
    content: {
      en: `<h2>The Legacy of Deg & Bhapka</h2>
<p>While modern commercial perfumery relies heavily on petroleum-derived aroma chemicals created in synthetic laboratories, Subaashghor remains committed to the ancient art of hydroponic steam distillation inside hand-hammered copper vessels known as <em>Degs</em>.</p>

<p>Connected by bamboo pipes (<em>Chonga</em>) to a cooling receiver pot (<em>Bhapka</em>) submerged in cold water tanks, this centuries-old apparatus distills aromatic botanicals over slow wood fires for several days without burning delicate floral compounds.</p>

<h2>Sandalwood Base Aging: The Secret of Depth</h2>
<p>Unlike industrial fragrances diluted with synthetic alcohol, our natural attars use pure aged Mysore Sandalwood oil or natural botanical carriers inside the receiver pot. As aromatic vapors condense, they fuse seamlessly into the sandalwood base, yielding a buttery, round aroma that matures for months inside dark glass carboys.</p>

<p>Explore our heritage-driven floral line including <a href="/products/rose-musk" style="color:#d4af37; font-weight:600;">Rose Musk Attar</a> and our signature <a href="/products/oud-royale" style="color:#d4af37; font-weight:600;">Oud Royale</a>.</p>

<p>Learn more about our brand journey on <a href="/heritage" style="color:#d4af37; font-weight:600;">Our Heritage Page</a> or explore our full catalog at <a href="/shop" style="color:#d4af37; font-weight:600;">Subaashghor Shop</a>.</p>`,

      bn: `<h2>দেগ ও ভপকার ঐতিহ্যবাহী ধারা</h2>
<p>আধুনিক বাণিজ্যিক পারফিউম শিল্পে যেখানে সিন্থেটিক উপাদান ব্যবহার করা হয়, সেখানে সুবাসঘর এখনো ধরে রেখেছে তামা পাত্রে বাষ্প পাতনের প্রাচীন ঐতিহ্য। হাতে তৈরি তামার বিশেষ পাত্র যাকে বলা হয় <em>দেগ</em>, তা দিয়ে প্রথাগত উপায়ে সুবাস তৈরি করা হয়।</p>

<p>বাঁশের পাইপ (<em>চোঙ্গা</em>) এর মাধ্যমে এই দেগ যুক্ত থাকে ঠাণ্ডা পানির ট্যাঙ্কে ডুবে থাকা রিসিভার পাত্র বা <em>ভপকা</em> এর সাথে। কাঠকয়লার ধীর আগুনে দিনব্যাপী পাতন প্রক্রিয়ায় ফুলের নির্যাস অক্ষতভাবে সংগৃহীত হয়।</p>

<h2>চন্দন তেলের বেস ম্যাচুরেশন</h2>
<p>অ্যালকোহলযুক্ত কৃত্রিম সুগন্ধির বিপরীতে আমাদের প্রাকৃতিক আতরে ব্যবহার করা হয় বিশুদ্ধ চন্দন তেলের বেস। বাষ্পীভূত গন্ধ যখন চন্দন তেলের সাথে মিশে যায়, তখন তৈরি হয় এক অপূর্ব, মসৃণ ও মাখনের মতো সুবাস যা কাঁচের বয়ামে মাসব্যাপী রেখে দিলে আরও গাঢ় ও দীর্ঘস্থায়ী হয়।</p>

<p>উপভোগ করুন আমাদের ঐতিহ্যবাহী পাতনে তৈরি <a href="/products/rose-musk" style="color:#d4af37; font-weight:600;">রোজ মাস্ক (Rose Musk)</a> এবং রাজকীয় <a href="/products/oud-royale" style="color:#d4af37; font-weight:600;">উদ রয়্যাল (Oud Royale)</a>।</p>

<p>আমাদের ইতিহাস ও কারিগরদের গল্প জানতে ভিজিট করুন <a href="/heritage" style="color:#d4af37; font-weight:600;">আমাদের ঐতিহ্য পেজ</a> অথবা সম্পূর্ণ ক্যাটালগ দেখুন <a href="/shop" style="color:#d4af37; font-weight:600;">সুবাসঘর শপে</a>।</p>`,
    },
    category: { bn: 'পর্দার আড়ালে', en: 'Behind the Scenes' },
    cover:
      'https://res.cloudinary.com/rc3ghq9c/image/upload/f_auto,q_auto/v1785147813/subaashghor/blog/rwgbjb5dzygdjbxes6cl.jpg',
    coverAlt:
      'Traditional copper deg and bhapka alembic attar distillation apparatus with glowing fire',
    date: new Date('2026-07-05'),
    readMinutes: 8,
    featured: false,
    published: true,
    author: {
      name: 'Subaashghor Editorial Team',
      avatarUrl:
        'https://res.cloudinary.com/rc3ghq9c/image/upload/v1672322312/subaashghor/author-avatar.jpg',
    },
    metaTitle: {
      bn: 'ঐতিহ্যবাহী তামার পাত্রে আতর পাতন প্রক্রিয়া | সুবাসঘর',
      en: 'Behind the Scenes: Traditional Copper Deg-Bhapka Distillation | Subaashghor',
    },
    metaDescription: {
      bn: 'দেখুন সুবাসঘরের কারখানায় কীভাবে ঐতিহ্যবাহী তামার পাত্রে ও কাঠকয়লার আগুনে আসল আতর তৈরি হয়।',
      en: 'Inside the copper alembic distillery of Subaashghor. Discover how pure non-alcoholic attar oils are crafted.',
    },
    metaKeywords:
      'deg bhapka distillation, attar making bangladesh, traditional perfume crafting, subaashghor heritage',
    canonicalUrl:
      'https://subaashghor.com/blog/artisan-distillation-behind-the-scenes',
    socialImage:
      'https://res.cloudinary.com/rc3ghq9c/image/upload/f_auto,q_auto/v1785147813/subaashghor/blog/rwgbjb5dzygdjbxes6cl.jpg',
    robotsMeta: {
      noindex: false,
      nofollow: false,
      noarchive: false,
    },
    faqs: [
      {
        question: {
          bn: 'সুবাসঘরের আতরে কি অ্যালকোহল ব্যবহার করা হয়?',
          en: 'Are Subaashghor attar oils 100% alcohol-free?',
        },
        answer: {
          bn: 'না, আমাদের সকল আতর ১০০% অ্যালকোহল-মুক্ত এবং প্রাকৃতিক উপায়ে পাতনকৃত।',
          en: 'No, all Subaashghor attars are 100% non-alcoholic, hydro-distilled pure concentrated oils.',
        },
      },
    ],
  },
  {
    slug: 'midnight-saffron-amber-evening-fragrance',
    title: {
      bn: 'মিডনাইট জাফরান ও অ্যাম্বার: জাঁকজমকপূর্ণ সান্ধ্যকালীন সিগনেচার সুবাস',
      en: 'Midnight Saffron & Amber: The Ultimate Evening Signature Scent',
    },
    excerpt: {
      bn: 'সন্ধ্যার অনুষ্ঠান ও শীতের রাতের জন্য কোন সুবাসটি আপনাকে অনন্য করে তুলবে? জানুন জাফরান ও ওয়ার্ম অ্যাম্বারের ম্যাজিক।',
      en: 'Elevate your evening presence with the intoxicating warmth of Kashmiri saffron, smoky vanilla, and golden amber resins.',
    },
    content: {
      en: `<h2>The Allure of Twilight Aromatics</h2>
<p>As dusk falls, evening temperatures shift the olfactory landscape. Delicate fresh citrus top notes recede, making way for deep, intoxicating accords that thrive in cooler night air. The combination of warm Kashmiri saffron and glowing fossilized amber resin creates an irresistible aura of mystery and luxury.</p>

<p>Our perfumers designed <a href="/products/midnight-saffron" style="color:#d4af37; font-weight:600;">Midnight Saffron Attar</a> specifically for formal dinners, weddings, and high-profile evening engagements. Paired with a warm base of dark vanilla and caramelized praline, it casts a captivating sillage that leaves a lasting impression long after you leave the room.</p>

<h2>Pairing Evening Attars with Royal Oud</h2>
<p>For those seeking an ultra-rich fragrance profile, consider layering a drop of <a href="/products/midnight-saffron" style="color:#d4af37; font-weight:600;">Midnight Saffron</a> over our iconic <a href="/products/oud-royale" style="color:#d4af37; font-weight:600;">Oud Royale Attar</a>. The woody Cambodian agarwood grounds the bittersweet saffron, creating a bespoke scent hierarchy fit for royalty.</p>

<p>Discover our complete evening scent selection at the <a href="/shop" style="color:#d4af37; font-weight:600;">Subaashghor Luxury Store</a> or consult our <a href="/scent-finder" style="color:#d4af37; font-weight:600;">Interactive Scent Matchmaker</a>.</p>`,

      bn: `<h2>সন্ধ্যার সুবাসের অনন্য আকর্ষণ</h2>
<p>দিন গড়িয়ে সন্ধ্যা নামলেই আবহাওয়ার পরিবর্তনের সাথে সাথে সুবাসের আবেদনও পরিবর্তিত হয়। দিনেরবেলার হালকা সাইট্রাস গন্ধের জায়গায় রাতের শীতল বাতাসে স্থান করে নেয় গাঢ়, উষ্ণ ও আভিজাত্যপূর্ণ সুবাস। কাশ্মীরি জাফরান এবং উষ্ণ অ্যাম্বারের নিখুঁত সমন্বয় তৈরি করে এক রহস্যময় ও রাজকীয় পরিবেশ।</p>

<p>আমাদের কারিগররা বিশেষভাবে সান্ধ্যকালীন সামাজিক অনুষ্ঠান, বিয়ে এবং বিশেষ রাতের অভিজ্ঞতার জন্য তৈরি করেছেন <a href="/products/midnight-saffron" style="color:#d4af37; font-weight:600;">মিডনাইট জাফরান (Midnight Saffron)</a>। এর সাথে ডার্ক ভ্যানিলা ও অ্যাম্বারের ছোঁয়া আপনাকে করবে জনসমাগমে অনন্য।</p>

<h2>রাজকীয় উদ-এর সাথে সান্ধ্যকালীন আতর মেলানোর কৌশল</h2>
<p>আরও গাঢ় ও দীর্ঘস্থায়ী সুবাসের জন্য <a href="/products/midnight-saffron" style="color:#d4af37; font-weight:600;">মিডনাইট জাফরানের</a> সাথে এক ফোটা <a href="/products/oud-royale" style="color:#d4af37; font-weight:600;">উদ রয়্যাল</a> লেয়ারিং করুন। কম্বোডিয়ান উদ-এর গাঢ় কাঠ ও জাফরানের তিক্ত-মিষ্টি মিলনে তৈরি হবে এক অনন্য সিগনেচার সুবাস।</p>

<p>আমাদের সান্ধ্যকালীন সুবাস কালেকশন দেখতে ভিজিট করুন <a href="/shop" style="color:#d4af37; font-weight:600;">সুবাসঘর শপ</a>।</p>`,
    },
    category: { bn: 'সুগন্ধি গাইড', en: 'Fragrance Guide' },
    cover:
      'https://res.cloudinary.com/rc3ghq9c/image/upload/f_auto,q_auto/v1785148337/subaashghor/blog/mfxhd6gexjomqiity3hs.jpg',
    coverAlt:
      'Luxury dark glass attar bottle with golden amber resin and saffron on black velvet',
    date: new Date('2026-07-24'),
    readMinutes: 6,
    featured: true,
    published: true,
    author: {
      name: 'Subaashghor Editorial Team',
      avatarUrl:
        'https://res.cloudinary.com/rc3ghq9c/image/upload/v1672322312/subaashghor/author-avatar.jpg',
    },
    metaTitle: {
      bn: 'মিডনাইট জাফরান ও অ্যাম্বার: সান্ধ্যকালীন পারফিউম গাইড | সুবাসঘর',
      en: 'Midnight Saffron & Amber Evening Scent Guide | Subaashghor',
    },
    metaDescription: {
      bn: 'বিশেষ রাতের অনুষ্ঠানের জন্য কীভাবে জাফরান ও অ্যাম্বারের রাজকীয় আতর ব্যবহার করবেন। পড়ুন সুবাসঘর পারফিউম গাইড।',
      en: 'Learn how to wear saffron and amber attars for evening events. Read Subaashghor fragrance guide.',
    },
    metaKeywords:
      'midnight saffron, evening attar bangladesh, amber perfume, luxury evening scent',
    canonicalUrl:
      'https://subaashghor.com/blog/midnight-saffron-amber-evening-fragrance',
    socialImage:
      'https://res.cloudinary.com/rc3ghq9c/image/upload/f_auto,q_auto/v1785148337/subaashghor/blog/mfxhd6gexjomqiity3hs.jpg',
    robotsMeta: { noindex: false, nofollow: false, noarchive: false },
    faqs: [
      {
        question: {
          bn: 'মিডনাইট জাফরান কি রাতে ব্যবহারের জন্য সেরা?',
          en: 'Is Midnight Saffron best suited for night wear?',
        },
        answer: {
          bn: 'হ্যাঁ, এর saffron, amber এবং smoky vanilla নোটগুলো শীতল সান্ধ্যকালীন আবহাওয়ায় সবচেয়ে ভালো ছড়ায়।',
          en: 'Yes, its warm saffron, amber, and vanilla profile projects best in cool evening temperatures.',
        },
      },
    ],
  },
  {
    slug: 'jasmine-noir-night-blooming-attars',
    title: {
      bn: 'জেসমিন নয়ার: নৈশকালীন ফুল ও রাজকীয় রজনীগন্ধার মুগ্ধকর সুবাস',
      en: 'Jasmine Noir: The Secret of Night-Blooming Floral Attars',
    },
    excerpt: {
      bn: 'রাতের আঁধারে ফোটা তাজা জেসমিন ও রজনীগন্ধার সুবাস কীভাবে মানসিক প্রশান্তি এনে দেয়। জানুন সুবাসঘরের বিশেষ তৈরি পদ্ধতি।',
      en: 'Explore the therapeutic calm and timeless elegance of white Sambac Jasmine and Tuberose extracted under starlight.',
    },
    content: {
      en: `<h2>The Magic of Night-Blooming Sambac Jasmine</h2>
<p>Unlike day-blooming flowers that attract pollinators with bright colors, night-blooming Jasmine (Sambac Jasmine) relies exclusively on intoxicating, ethereal aromas to attract night moths. Harvesting these starry white blossoms requires picking them right before midnight when their essential oil concentration peaks.</p>

<p>Our floral artisans distill these fresh night petals alongside velvety Tuberose and a warm Cedar-Vanilla base to create <a href="/products/jasmine-noir" style="color:#d4af37; font-weight:600;">Jasmine Noir Attar</a>. The result is a mysterious, creamy-white floral experience that soothes the mind and relieves stress after a demanding day.</p>

<h2>Aromatherapy Benefits of Natural Jasmine Attar</h2>
<p>Pure non-synthetic jasmine oil has been revered in ancient Ayurvedic and South Asian wellness traditions for centuries. Applying a dab behind your ears before bedtime promotes deep relaxation, lowers cortisol levels, and instills a serene mental clarity.</p>

<p>Try <a href="/products/jasmine-noir" style="color:#d4af37; font-weight:600;">Jasmine Noir</a> or complement it with our fresh <a href="/products/rose-musk" style="color:#d4af37; font-weight:600;">Rose Musk Attar</a>. Visit the <a href="/shop" style="color:#d4af37; font-weight:600;">Subaashghor Shop</a> to order online with fast nationwide delivery.</p>`,

      bn: `<h2>রাতের আঁধারে ফোটা জেসমিনের রহস্য</h2>
<p>দিনেরবেলা ফোটা ফুলের চেয়ে রাতের ফুল যেমন সামবাক জেসমিন ও রজনীগন্ধা বহু গুণ বেশি মিষ্টি সুবাস ছড়ায়। রাত ১২টার ঠিক আগে যখন ফুলের সুগন্ধি তেলের ঘনত্ব সর্বোচ্চ থাকে, তখন এগুলো যত্নসহকারে তোলা হয়।</p>

<p>আমাদের কারিগররা এই সতেজ পাপড়ির সাথে মসৃণ টিউবোজ ও ভ্যানিলার সমবায় তৈরি করেছেন <a href="/products/jasmine-noir" style="color:#d4af37; font-weight:600;">জেসমিন নয়ার (Jasmine Noir)</a>। এর মিষ্টি ও প্রশান্তিদায়ক সুবাস সারাদিনের ক্লান্তি দূর করে মানসিক শান্তি এনে দেয়।</p>

<h2>প্রাকৃতিক জেসমিন আতরের অ্যারোমাথেরাপি উপকারিতা</h2>
<p>খাঁটি জেসমিন অয়েল বহু শতাব্দী ধরে মানসিক চাপ কমাতে ও ঘুমের মান উন্নত করতে ব্যবহৃত হয়ে আসছে। রাতে ঘুমানোর আগে কানের পেছনে এক ফোটা ব্যবহার করলে মন রিফ্রেশ থাকে।</p>

<p>ট্রাই করুন <a href="/products/jasmine-noir" style="color:#d4af37; font-weight:600;">জেসমিন নয়ার</a> অথবা দেখুন আমাদের <a href="/products/rose-musk" style="color:#d4af37; font-weight:600;">রোজ মাস্ক</a>। অর্ডার করতে ভিজিট করুন <a href="/shop" style="color:#d4af37; font-weight:600;">সুবাসঘর অনলাইন শপ</a>।</p>`,
    },
    category: { bn: 'ঐতিহ্য', en: 'Heritage' },
    cover:
      'https://res.cloudinary.com/rc3ghq9c/image/upload/f_auto,q_auto/v1785148339/subaashghor/blog/rlt6hdcpteakxevl8xat.jpg',
    coverAlt:
      'Fresh white Sambac jasmine blooming next to an ornate black crystal attar flacon under moonlight',
    date: new Date('2026-07-26'),
    readMinutes: 5,
    featured: false,
    published: true,
    author: {
      name: 'Subaashghor Editorial Team',
      avatarUrl:
        'https://res.cloudinary.com/rc3ghq9c/image/upload/v1672322312/subaashghor/author-avatar.jpg',
    },
    metaTitle: {
      bn: 'জেসমিন নয়ার ও নৈশকালীন ফুলের সুবাস ইতিহাস | সুবাসঘর',
      en: 'Jasmine Noir & Night-Blooming Floral Attar History | Subaashghor',
    },
    metaDescription: {
      bn: 'জানুন রাতে ফোটা জেসমিন ও রজনীগন্ধা দিয়ে কীভাবে মানসিক প্রশান্তিদায়ক প্রিমিয়াম আতর তৈরি হয়।',
      en: 'Discover how night-blooming Sambac jasmine and tuberose create soothing luxury attars.',
    },
    metaKeywords:
      'jasmine noir, jasmine attar bangladesh, floral attar, subaashghor',
    canonicalUrl:
      'https://subaashghor.com/blog/jasmine-noir-night-blooming-attars',
    socialImage:
      'https://res.cloudinary.com/rc3ghq9c/image/upload/f_auto,q_auto/v1785148339/subaashghor/blog/rlt6hdcpteakxevl8xat.jpg',
    robotsMeta: { noindex: false, nofollow: false, noarchive: false },
    faqs: [],
  },
  {
    slug: 'understanding-perfume-pyramid-notes-guide',
    title: {
      bn: 'পারফিউম পিরামিড ১০০: টপ, হার্ট এবং বেস নোটের সম্পূর্ণ ব্যাখ্যা',
      en: 'Perfumery Notes 101: Understanding Top, Heart & Base Notes',
    },
    excerpt: {
      bn: 'পারফিউম বা আতর লাগানোর পর কেন সময়ের সাথে সাথে গন্ধ বদলায়? শিখুন সুগন্ধির তিন স্তরের রহস্য।',
      en: 'Demystify the olfactive pyramid. Discover how top notes, floral heart accords, and woody base resins interact over time.',
    },
    content: {
      en: `<h2>Decoding the Olfactive Pyramid</h2>
<p>Have you ever noticed that a perfume smells completely different after two hours than it did when you first applied it? This dynamic progression is called the <strong>Olfactive Pyramid</strong>, consisting of three distinct layers of volatile essential oils:</p>

<h3>1. Top Notes (The Initial Impression)</h3>
<p>Top notes are light, volatile molecules that hit your nose immediately upon application. Ingredients like Bergamot, Pink Pepper, and Saffron evaporate within 15 to 30 minutes, giving you a refreshing opening sparkle.</p>

<h3>2. Heart Notes (The Personality)</h3>
<p>As top notes fade, the heart notes emerge to form the main character of the fragrance. Heavy florals like Damask Rose, Sambac Jasmine, and Cambodian Agarwood dominate this stage, lasting 3 to 5 hours.</p>

<h3>3. Base Notes (The Soul & Sillage)</h3>
<p>Base notes consist of large, slow-evaporating molecules like Mysore Sandalwood, White Musk, Vanilla, and Amber. They bind to your skin for 12 to 24+ hours, leaving an unforgettable trail (sillage).</p>

<p>Compare the note structures of <a href="/products/oud-royale" style="color:#d4af37; font-weight:600;">Oud Royale</a>, <a href="/products/rose-musk" style="color:#d4af37; font-weight:600;">Rose Musk</a>, and <a href="/products/midnight-saffron" style="color:#d4af37; font-weight:600;">Midnight Saffron</a> to find your ideal note composition on our <a href="/shop" style="color:#d4af37; font-weight:600;">Product Showcase</a>.</p>`,

      bn: `<h2>সুগন্ধির তিন স্তরের রহস্য</h2>
<p>আপনি কি খেয়াল করেছেন যে আতর বা পারফিউম লাগানোর সাথে সাথে যে গন্ধ পাওয়া যায়, দুই ঘণ্টা পর তার সুবাস কিছুটা বদলে যায়? এই পরিবর্তনকে বলা হয় <strong>সুগন্ধি পিরামিড (Olfactive Pyramid)</strong>, যা তিনটি স্তরে বিভক্ত:</p>

<h3>১. টপ নোট (প্রথম অভিজ্ঞতা)</h3>
<p>আতর ছোঁয়ানোর প্রথম ১৫-৩০ মিনিটের মধ্যে বার্গামট, গোলাপী মরিচ বা জাফরানের মতো হালকা সুবাস পাওয়া যায়।</p>

<h3>২. হার্ট নোট (সুগন্ধির আসল ব্যক্তিত্ব)</h3>
<p>টপ নোট কেটে যাওয়ার পর ভেসে ওঠে দামাস্ক গোলাপ, রজনীগন্ধা বা আগর কাঠের আসল হৃদস্পন্দন, যা ৩-৫ ঘণ্টা স্থায়ী হয়।</p>

<h3>৩. বেস নোট (স্থায়ী সুবাস ও আত্মা)</h3>
<p>সবশেষে মাস্ক, চন্দন ও অ্যাম্বারের গাঢ় অনু ত্বকে ১২-২৪ ঘণ্টা স্থায়ী সুবাসের ছাপ রেখে যায়।</p>

<p>আপনার পছন্দের নোট নির্বাচন করতে সাহায্য নিন <a href="/scent-finder" style="color:#d4af37; font-weight:600;">সেন্ট ফাইন্ডার</a> টুল থেকে।</p>`,
    },
    category: { bn: 'টিপস ও যত্ন', en: 'Tips & Care' },
    cover:
      'https://res.cloudinary.com/rc3ghq9c/image/upload/f_auto,q_auto/v1785148342/subaashghor/blog/iyrv4cngmxyjsc2msgto.jpg',
    coverAlt:
      'Artistic arrangement of raw perfume ingredients: bergamot, rose petals, vanilla sticks, and sandalwood on marble',
    date: new Date('2026-07-27'),
    readMinutes: 6,
    featured: false,
    published: true,
    author: {
      name: 'Subaashghor Editorial Team',
      avatarUrl:
        'https://res.cloudinary.com/rc3ghq9c/image/upload/v1672322312/subaashghor/author-avatar.jpg',
    },
    metaTitle: {
      bn: 'পারফিউম ও আতরের নোট বোঝা: টপ, হার্ট ও বেস নোট গাইড | সুবাসঘর',
      en: 'Perfumery Notes 101: Top, Heart & Base Notes Explained | Subaashghor',
    },
    metaDescription: {
      bn: 'শিখুন কীভাবে টপ, হার্ট এবং বেস নোট কাজ করে। সুবাসঘরের সহজ ও সম্পূর্ণ পারফিউম গাইড।',
      en: 'Complete guide to perfume notes: top, heart, and base notes explained.',
    },
    metaKeywords:
      'perfume notes explained, attar notes bangladesh, top heart base notes',
    canonicalUrl:
      'https://subaashghor.com/blog/understanding-perfume-pyramid-notes-guide',
    socialImage:
      'https://res.cloudinary.com/rc3ghq9c/image/upload/f_auto,q_auto/v1785148342/subaashghor/blog/iyrv4cngmxyjsc2msgto.jpg',
    robotsMeta: { noindex: false, nofollow: false, noarchive: false },
    faqs: [],
  },
  {
    slug: 'non-alcoholic-attar-oil-vs-alcohol-perfumes',
    title: {
      bn: 'অ্যালকোহল বনাম খাঁটি আতর: কেন প্রাকৃতিক অয়েল পারফিউম ত্বকের জন্য সেরা',
      en: 'Alcohol vs Pure Attar: Why Non-Alcoholic Oil Perfumes are Superior',
    },
    excerpt: {
      bn: 'অ্যালকোহলযুক্ত স্প্রে পারফিউম কি ত্বক শুষ্ক করে ফেলে? জানুন ১০০% প্রাকৃতিক আতর তেলের দীর্ঘস্থায়ী ও স্বাস্থ্যকর সুবিধা।',
      en: 'Discover why non-alcoholic concentrated attar oils nourish skin, prevent allergic dryness, and deliver richer long-lasting projection.',
    },
    content: {
      en: `<h2>The Hidden Problem with Synthetic Spray Perfumes</h2>
<p>Most mass-market commercial perfumes contain 80% to 90% denatured ethyl alcohol (SD Alcohol 40). While alcohol creates an explosive initial spray mist, it rapidly strips skin of natural sebum, causing dryness, irritation, and accelerated evaporation of fragile fragrance oils within 2 to 3 hours.</p>

<h2>The Botanical Science of Concentrated Attar Oils</h2>
<p>Pure attars produced at Subaashghor are 100% non-alcoholic concentrated perfume oils. Instead of harsh chemical solvents, our formulas utilize pure botanical carrier oils or aged sandalwood distillate. This offers three unmatched benefits:</p>

<ul>
  <li><strong>Skin Nourishment:</strong> Botanical oils hydrate pulse points instead of drying them.</li>
  <li><strong>Subtle, Intimate Sillage:</strong> Attar stays close to your skin, creating a sophisticated aromatic aura rather than an overwhelming chemical cloud.</li>
  <li><strong>Zero Headaches:</strong> Pure natural ingredients reduce olfactory fatigue and synthetic fragrance headaches.</li>
</ul>

<p>Switch to pure non-alcoholic perfumery today. Explore <a href="/products/oud-royale" style="color:#d4af37; font-weight:600;">Oud Royale</a> or <a href="/products/rose-musk" style="color:#d4af37; font-weight:600;">Rose Musk</a> at the <a href="/shop" style="color:#d4af37; font-weight:600;">Subaashghor Storefront</a>.</p>`,

      bn: `<h2>কৃত্রিম অ্যালকোহল পারফিউমের গোপন সমস্যা</h2>
<p>বাজারের সাধারণ পারফিউমে ৮০% থেকে ৯০% অ্যালকোহল থাকে। অ্যালকোহল স্প্রে করলে সাময়িক সুবাস মিললেও এটি ত্বককে শুষ্ক করে ফেলে এবং ২-৩ ঘণ্টার মধ্যে উবে যায়।</p>

<h2>প্রাকৃতিক আতর তেলের অতুলনীয় সুবিধা</h2>
<p>সুবাসঘরের সকল আতর ১০০% অ্যালকোহল-মুক্ত বিশুদ্ধ কনসেন্ট্রেটেড তেল। এর ফলে তিনটি বিশেষ সুবিধা পাওয়া যায়:</p>

<ul>
  <li><strong>ত্বকের যত্ন:</strong> প্রাকৃতিক তেল ত্বককে মশ্চারাইজড রাখে।</li>
  <li><strong>দীর্ঘস্থায়ী সুবাস:</strong> অ্যালকোহলের মতো উবে না গিয়ে সারাদিন ত্বকে লেগে থাকে।</li>
  <li><strong>মাথা ব্যথামুক্ত:</strong> কৃত্রিম কেমিক্যাল না থাকায় এটি ব্যবহারে অ্যালার্জি বা মাথা ব্যথার ঝুঁকি নেই।</li>
</ul>

<p>আজই ব্যবহার শুরু করুন খাঁটি আতর: ট্রাই করুন <a href="/products/oud-royale" style="color:#d4af37; font-weight:600;">উদ রয়্যাল</a> ও <a href="/products/rose-musk" style="color:#d4af37; font-weight:600;">রোজ মাস্ক</a>। ভিজিট করুন <a href="/shop" style="color:#d4af37; font-weight:600;">সুবাসঘর শপ</a>।</p>`,
    },
    category: { bn: 'সুগন্ধি গাইড', en: 'Fragrance Guide' },
    cover:
      'https://res.cloudinary.com/rc3ghq9c/image/upload/f_auto,q_auto/v1785148345/subaashghor/blog/o66dm0qlle8imbuxgm8x.jpg',
    coverAlt:
      'Side-by-side comparison of a pure natural attar oil drop on skin vs spray mist',
    date: new Date('2026-07-27'),
    readMinutes: 6,
    featured: true,
    published: true,
    author: {
      name: 'Subaashghor Editorial Team',
      avatarUrl:
        'https://res.cloudinary.com/rc3ghq9c/image/upload/v1672322312/subaashghor/author-avatar.jpg',
    },
    metaTitle: {
      bn: 'অ্যালকোহল বনাম প্রাকৃতিক আতর: ত্বকের জন্য কোনটি ভালো? | সুবাসঘর',
      en: 'Alcohol vs Pure Attar Oil Comparison | Subaashghor',
    },
    metaDescription: {
      bn: 'জানুন কেন ১০০% অ্যালকোহল-মুক্ত আতর তেল ত্বকের জন্য নিরাপদ ও বেশি দীর্ঘস্থায়ী।',
      en: 'Compare non-alcoholic attar oils with alcohol spray perfumes. Learn benefits for skin and sillage.',
    },
    metaKeywords:
      'non alcoholic attar, attar vs perfume bangladesh, natural perfume oil',
    canonicalUrl:
      'https://subaashghor.com/blog/non-alcoholic-attar-oil-vs-alcohol-perfumes',
    socialImage:
      'https://res.cloudinary.com/rc3ghq9c/image/upload/f_auto,q_auto/v1785148345/subaashghor/blog/o66dm0qlle8imbuxgm8x.jpg',
    robotsMeta: { noindex: false, nofollow: false, noarchive: false },
    faqs: [],
  },
  {
    slug: 'storing-attars-and-perfumes-in-humidity',
    title: {
      bn: 'বাংলাদেশের আদ্র আবহাওয়ায় প্রিমিয়াম আতর সংরক্ষণের সঠিক নিয়ম',
      en: 'How to Properly Store Your Luxury Attar Collection in Humidity',
    },
    excerpt: {
      bn: 'আপনার শখের পারফিউম ও আতরের বোতল কত বছর ভালো থাকবে? জানুন আলো, তাপ ও আদ্রতা থেকে রক্ষার উপায়।',
      en: 'Protect your valuable attar bottles from heat oxidation, UV breakdown, and humidity moisture. Extend perfume shelf-life by years.',
    },
    content: {
      en: `<h2>The 3 Enemies of Fine Fragrance</h2>
<p>Natural attar oils can mature gracefully for decades — often deepening in richness like fine vintage liquids — if stored properly. However, three environmental factors can oxidize delicate aromatic bonds:</p>

<ol>
  <li><strong>Direct Sunlight (UV Rays):</strong> UV radiation breaks down delicate floral esters into sour, rancid notes.</li>
  <li><strong>Heat Fluctuations:</strong> Storing bottles inside warm cars or near hot appliances causes rapid thermal expansion.</li>
  <li><strong>Excess Humidity:</strong> Leaving glass flacons unsealed in bathrooms allows water vapor to seep into concentrated oil.</li>
</ol>

<h2>The Golden Rules of Attar Care</h2>
<p>To preserve your <a href="/products/midnight-saffron" style="color:#d4af37; font-weight:600;">Midnight Saffron</a> or <a href="/products/jasmine-noir" style="color:#d4af37; font-weight:600;">Jasmine Noir</a> bottles for years:</p>

<ul>
  <li>Keep bottles upright inside a dark carved wooden box or velvet-lined drawer.</li>
  <li>Ensure brass caps and glass wands are tightened securely after each application.</li>
  <li>Maintain a stable room temperature around 20°C to 24°C.</li>
</ul>

<p>Explore our complete artisan collection at the <a href="/shop" style="color:#d4af37; font-weight:600;">Subaashghor Official Shop</a>.</p>`,

      bn: `<h2>আতর নষ্ট হওয়ার ৩টি প্রধান শত্রু</h2>
<p>সঠিক উপায়ে রাখলে খাঁটি আতর বছরের পর বছর ভালো থাকে এবং সময়ের সাথে এর সুবাস আরও গাঢ় হয়। কিন্তু তিনটি উপাদান আতরের গুণমান নষ্ট করতে পারে:</p>

<ol>
  <li><strong>সরাসরি রোদ (UV রশ্মি):</strong> সূর্যের আলো তেলের প্রাকৃতিক সুবাস নষ্ট করে টক ভাব এনে দেয়।</li>
  <li><strong>তাপমাত্রার ওঠানামা:</strong> অতিরিক্ত গরমে আতরের অনু ভেঙে যায়।</li>
  <li><strong>বাতাসের আদ্রতা:</strong> বাথরুমের ভেজা পরিবেশে বোতলের মুখে পানি জমে তেল নষ্ট হতে পারে।</li>
</ol>

<h2>আতর সংরক্ষণের সোনালী নিয়ম</h2>
<p>আপনার প্রিয় <a href="/products/midnight-saffron" style="color:#d4af37; font-weight:600;">মিডনাইট জাফরান</a> ও <a href="/products/jasmine-noir" style="color:#d4af37; font-weight:600;">জেসমিন নয়ার</a> দীর্ঘদিন ভালো রাখতে কাঠের বাক্সে বা ড্রয়ারে অন্ধকার স্থানে রাখুন। বোতলের মুখ সবসময় শক্ত করে বন্ধ রাখুন।</p>

<p>আমাদের সকল আতর কালেকশন দেখতে ভিজিট করুন <a href="/shop" style="color:#d4af37; font-weight:600;">সুবাসঘর শপ</a>।</p>`,
    },
    category: { bn: 'টিপস ও যত্ন', en: 'Tips & Care' },
    cover:
      'https://res.cloudinary.com/rc3ghq9c/image/upload/f_auto,q_auto/v1785148347/subaashghor/blog/bumjm1qdbn91pyyb0mkp.jpg',
    coverAlt:
      'Ornate dark mahogany wooden box holding glass attar bottles on a warm vanity table',
    date: new Date('2026-07-27'),
    readMinutes: 5,
    featured: false,
    published: true,
    author: {
      name: 'Subaashghor Editorial Team',
      avatarUrl:
        'https://res.cloudinary.com/rc3ghq9c/image/upload/v1672322312/subaashghor/author-avatar.jpg',
    },
    metaTitle: {
      bn: 'আতর ও পারফিউম সংরক্ষণের সঠিক উপায় | সুবাসঘর যত্ন গাইড',
      en: 'How to Store Attars & Perfumes in Humidity | Subaashghor',
    },
    metaDescription: {
      bn: 'জানুন কীভাবে রোদ, তাপ ও আদ্রতা থেকে আপনার শখের আতর বছরের পর বছর সতেজ রাখবেন।',
      en: 'Learn how to store natural attar bottles in humid climate to preserve fragrance life.',
    },
    metaKeywords:
      'attar storage tips bangladesh, how to store perfume, subaashghor care guide',
    canonicalUrl:
      'https://subaashghor.com/blog/storing-attars-and-perfumes-in-humidity',
    socialImage:
      'https://res.cloudinary.com/rc3ghq9c/image/upload/f_auto,q_auto/v1785148347/subaashghor/blog/bumjm1qdbn91pyyb0mkp.jpg',
    robotsMeta: { noindex: false, nofollow: false, noarchive: false },
    faqs: [],
  },
];

const mockCoupons = [
  {
    code: 'WELCOME10',
    type: 'percent',
    value: 10,
    minSubtotal: 2000,
    active: true,
  },
  {
    code: 'FREESHIP',
    type: 'flat',
    value: 130,
    minSubtotal: 1500,
    active: true,
  },
];

const seed = async () => {
  try {
    let connected = false;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        console.log(`Connecting to MongoDB (Attempt ${attempt}/5)...`);
        await mongoose.connect(dbUrl, { serverSelectionTimeoutMS: 15000 });
        connected = true;
        console.log('🎉 Connected to MongoDB Atlas successfully!');
        break;
      } catch (connErr: any) {
        console.warn(
          `Connection attempt ${attempt} failed: ${connErr.message}. Retrying in 3s...`,
        );
        await new Promise((res) => setTimeout(res, 3000));
      }
    }

    if (!connected) {
      throw new Error('Failed to connect to MongoDB after 5 attempts.');
    }

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
    const oudRoyaleProduct = insertedProducts.find(
      (p) => p.slug === 'oud-royale',
    );
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
