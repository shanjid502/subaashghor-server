import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Import Models relatively from src/app/modules
import { UserModel } from '../src/app/modules/Auth/auth.model';
import { CollectionModel } from '../src/app/modules/Collection/collection.model';
import { ProductModel } from '../src/app/modules/Product/product.model';
import { PostModel } from '../src/app/modules/Post/post.model';
import { ReviewModel } from '../src/app/modules/Review/review.model';
import { OrderModel } from '../src/app/modules/Order/order.model';
import { CouponModel } from '../src/app/modules/Coupon/coupon.model';
import { SettingsModel } from '../src/app/modules/Settings/settings.model';
import { RedirectModel } from '../src/app/modules/Redirect/redirect.model';
import { QuestionModel } from '../src/app/modules/ScentFinder/scentfinder.model';
import { NewslatterModel } from '../src/app/modules/Newslatter/newslatter.model';

dotenv.config({ path: path.join(__dirname, '../.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Paths to local generated images
const imagePaths = {
  oud: path.join(__dirname, '../../../../.gemini/antigravity/brain/4f143241-337f-41f3-8fb4-67bef9b197ba/luxury_perfume_oud_1783097642772.png'),
  rose: path.join(__dirname, '../../../../.gemini/antigravity/brain/4f143241-337f-41f3-8fb4-67bef9b197ba/luxury_perfume_rose_1783097657928.png'),
  jasmine: path.join(__dirname, '../../../../.gemini/antigravity/brain/4f143241-337f-41f3-8fb4-67bef9b197ba/luxury_perfume_jasmine_1783097673031.png'),
  bergamot: path.join(__dirname, '../../../../.gemini/antigravity/brain/4f143241-337f-41f3-8fb4-67bef9b197ba/note_bergamot_1783097691852.png'),
  sandalwood: path.join(__dirname, '../../../../.gemini/antigravity/brain/4f143241-337f-41f3-8fb4-67bef9b197ba/note_sandalwood_1783097710928.png'),
  musk: path.join(__dirname, '../../../../.gemini/antigravity/brain/4f143241-337f-41f3-8fb4-67bef9b197ba/note_musk_1783097728277.png'),
};

const uploadToCloudinary = async (filePath: string, publicId: string, retries = 3): Promise<string> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Uploading ${publicId} to Cloudinary (Attempt ${attempt}/${retries})...`);
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'subaashghor/demo',
        public_id: publicId,
        overwrite: true,
      });
      console.log(`Uploaded! URL: ${result.secure_url}`);
      return result.secure_url;
    } catch (error) {
      console.error(`Attempt ${attempt} failed to upload ${publicId}:`, error);
      if (attempt === retries) {
        console.warn(`All attempts failed for ${publicId}. Falling back to placeholder.`);
        // Return a successful Cloudinary URL from previous upload if possible, or standard fallback
        return `https://res.cloudinary.com/demo/image/upload/v1672322312/blog-1.jpg`;
      }
      // Wait 2.5 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }
  }
  return `https://res.cloudinary.com/demo/image/upload/v1672322312/blog-1.jpg`;
};

const seed = async () => {
  try {
    // 1. Connect to Database
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not defined in env');
    }
    console.log('Connecting to database...');
    await mongoose.connect(dbUrl);
    console.log('Database connected successfully!');

    // 2. Upload images to Cloudinary
    console.log('Uploading AI-generated premium assets to Cloudinary...');
    const urlOud = await uploadToCloudinary(imagePaths.oud, 'perfume_oud_royale');
    const urlRose = await uploadToCloudinary(imagePaths.rose, 'perfume_rose_musk');
    const urlJasmine = await uploadToCloudinary(imagePaths.jasmine, 'perfume_jasmine_noir');
    const urlBergamot = await uploadToCloudinary(imagePaths.bergamot, 'note_bergamot');
    const urlSandalwood = await uploadToCloudinary(imagePaths.sandalwood, 'note_sandalwood');
    const urlMusk = await uploadToCloudinary(imagePaths.musk, 'note_musk');

    // 3. Clear Existing Data
    console.log('Clearing existing database collections...');
    await Promise.all([
      UserModel.deleteMany({}),
      CollectionModel.deleteMany({}),
      ProductModel.deleteMany({}),
      PostModel.deleteMany({}),
      ReviewModel.deleteMany({}),
      OrderModel.deleteMany({}),
      CouponModel.deleteMany({}),
      SettingsModel.deleteMany({}),
      RedirectModel.deleteMany({}),
      QuestionModel.deleteMany({}),
      NewslatterModel.deleteMany({}),
    ]);
    console.log('Collections cleared.');

    // 4. Create Users (Super Admin and Standard Customer)
    console.log('Creating users...');

    const adminUser = await UserModel.create({
      name: process.env.SUPER_ADMIN_NAME || 'Shanjid Ahmad',
      email: process.env.SUPER_ADMIN_EMAIL || 'captainlevi9111@gmail.com',
      phone: process.env.SUPER_ADMIN_PHONE || '01724104606',
      passwordHash: process.env.SUPER_ADMIN_PASS || 'fohtasdh@@42sg!22',
      role: 'admin',
      emailVerified: true,
      phoneVerified: true,
    });

    const customerUser = await UserModel.create({
      name: 'Rahim Uddin',
      email: 'rahim@gmail.com',
      phone: '01812345678',
      passwordHash: 'customer123!',
      role: 'customer',
      emailVerified: true,
      phoneVerified: true,
      addresses: [
        {
          label: 'Home',
          name: 'Rahim Uddin',
          phone: '01812345678',
          address: 'House 42, Road 9A, Dhanmondi',
          area: 'Dhanmondi',
          city: 'Dhaka',
          district: 'Dhaka',
          postcode: '1209',
          isDefault: true,
        }
      ]
    });

    const customerUser2 = await UserModel.create({
      name: 'Nusrat Jahan',
      email: 'nusrat@gmail.com',
      phone: '01987654321',
      passwordHash: 'customer123!',
      role: 'customer',
      emailVerified: true,
      phoneVerified: true,
    });

    console.log(`Created 3 users: 1 Admin, 2 Customers.`);

    // 5. Create Collections
    console.log('Creating collections...');
    const collectionsData = [
      {
        slug: 'men',
        name: { en: 'For Men', bn: 'পুরুষদের জন্য' },
        description: { en: 'Bold, spicy, and woody attars designed for men.', bn: 'সাহসী, মসলাদার এবং কাঠের সুবাসযুক্ত আকর যা পুরুষদের জন্য তৈরি।' },
        cover: urlOud,
        order: 1,
        isActive: true,
      },
      {
        slug: 'women',
        name: { en: 'For Women', bn: 'নারীদের জন্য' },
        description: { en: 'Elegant floral, sweet, and musk blends for women.', bn: 'নারীদের জন্য মার্জিত ফুলের, মিষ্টি এবং কস্তুরী সুবাসের মিশ্রণ।' },
        cover: urlRose,
        order: 2,
        isActive: true,
      },
      {
        slug: 'attar',
        name: { en: 'Pure Attar Oils', bn: 'খাঁটি আতর তেল' },
        description: { en: 'Alcohol-free, long-lasting concentrated attar extracts.', bn: 'অ্যালকোহল-মুক্ত, দীর্ঘস্থায়ী ঘনীভূত আতর নির্যাস।' },
        cover: urlJasmine,
        order: 3,
        isActive: true,
      },
      {
        slug: 'unisex',
        name: { en: 'Unisex Collection', bn: 'ইউনিসেক্স কালেকশন' },
        description: { en: 'Harmonious fragrances suitable for all genders.', bn: 'সকল লিঙ্গের জন্য উপযুক্ত সুরেলা সুগন্ধি।' },
        cover: urlOud,
        order: 4,
        isActive: true,
      },
    ];
    await CollectionModel.insertMany(collectionsData);
    console.log(`Created ${collectionsData.length} collections.`);

    // 6. Create Products
    console.log('Creating products...');
    const productsData = [
      {
        slug: 'oud-royale',
        name: { en: 'Oud Royale', bn: 'উদ রয়্যাল' },
        tagline: { en: 'Mystical Golden Cambodian Oud', bn: 'রহস্যময় সোনালী কম্বোডিয়ান উদ' },
        description: {
          en: 'An opulent journey of rare Cambodian oud wood blended with rich sandalwood and base musk. Created for those who appreciate pure, deep, woody notes.',
          bn: 'বিরল কম্বোডিয়ান উদ কাঠের সাথে সমৃদ্ধ চন্দন কাঠ এবং বেস কস্তুরীর এক ঐশ্বর্যশালী যাত্রা। যারা খাঁটি, গভীর এবং কাঠের সুবাস পছন্দ করেন তাদের জন্য নির্মিত।'
        },
        images: [urlOud, urlJasmine],
        price: 3500,
        salePrice: 2990,
        badge: { en: 'Best Seller', bn: 'সেরা বিক্রেতা' },
        badges: ['Best Seller'],
        notes: {
          top: [{ name: 'Bergamot', icon: urlBergamot }],
          heart: [{ name: 'Sandalwood', icon: urlSandalwood }],
          base: [{ name: 'Cambodian Oud', icon: urlMusk }]
        },
        category: 'attar',
        collections: ['attar', 'men', 'unisex'],
        sizes: [
          { ml: 3, price: 990, salePrice: 890, stock: 25, sku: 'OUD-ROY-3ML' },
          { ml: 6, price: 1800, salePrice: 1600, stock: 15, sku: 'OUD-ROY-6ML' },
          { ml: 12, price: 3500, salePrice: 2990, stock: 10, sku: 'OUD-ROY-12ML' }
        ],
        rating: 4.8,
        reviewCount: 2,
        pairsWith: ['rose-musk'],
        isActive: true,
        metaTitle: { en: 'Buy Premium Cambodian Oud Royale Attar Oil', bn: 'প্রিমিয়াম কম্বোডিয়ান উদ রয়্যাল আতর কিনুন' },
        metaDescription: {
          en: 'Purchase long-lasting alcohol-free Oud Royale attar. Free delivery inside Bangladesh.',
          bn: 'দীর্ঘস্থায়ী অ্যালকোহল-মুক্ত উদ রয়্যাল আতর কিনুন। সারা বাংলাদেশে ফ্রি ডেলিভারি।'
        },
        faqs: [
          {
            question: { en: 'How long does the scent last?', bn: 'সুবাসটি কতক্ষণ স্থায়ী হয়?' },
            answer: {
              en: 'Since it is a highly concentrated pure oil, it typically lasts 12-24 hours on fabric and 8-12 hours on skin.',
              bn: 'যেহেতু এটি একটি অত্যন্ত ঘনীভূত খাঁটি তেল, এটি সাধারণত কাপড়ে ১২-২৪ ঘণ্টা এবং ত্বকে ৮-১২ ঘণ্টা স্থায়ী হয়।'
            }
          },
          {
            question: { en: 'Is this attar completely alcohol-free?', bn: 'এই আতরটি কি সম্পূর্ণ অ্যালকোহল-মুক্ত?' },
            answer: {
              en: 'Yes, all Subaashghor attars are 100% alcohol-free and skin-friendly.',
              bn: 'হ্যাঁ, সুবাসঘর-এর সব আতর ১০০% অ্যালকোহল-মুক্ত এবং ত্বকের জন্য নিরাপদ।'
            }
          }
        ]
      },
      {
        slug: 'rose-musk',
        name: { en: 'Rose Musk', bn: 'রোজ মাস্ক' },
        tagline: { en: 'Velvety Taif Rose & Creamy Musk', bn: 'মখমলি তায়েফ গোলাপ ও ক্রিমি মাস্ক' },
        description: {
          en: 'A classic, elegant mixture of fresh Taif rose petals layered over a soft, warm bed of premium white musk.',
          bn: 'প্রিমিয়াম সাদা কস্তুরীর নরম, উষ্ণ শয্যার উপর স্তরিত তাজা তায়েফ গোলাপের পাপড়ির একটি ধ্রুপদী, মার্জিত মিশ্রণ।'
        },
        images: [urlRose, urlOud],
        price: 2400,
        salePrice: 1990,
        badge: { en: 'Popular', bn: 'জনপ্রিয়' },
        badges: ['Popular'],
        notes: {
          top: [{ name: 'Taif Rose', icon: urlRose }],
          heart: [{ name: 'Jasmine', icon: urlJasmine }],
          base: [{ name: 'White Musk', icon: urlMusk }]
        },
        category: 'women',
        collections: ['women', 'unisex'],
        sizes: [
          { ml: 3, price: 650, stock: 40, sku: 'ROS-MSK-3ML' },
          { ml: 6, price: 1200, salePrice: 1100, stock: 20, sku: 'ROS-MSK-6ML' },
          { ml: 12, price: 2400, salePrice: 1990, stock: 12, sku: 'ROS-MSK-12ML' }
        ],
        rating: 4.5,
        reviewCount: 1,
        pairsWith: ['oud-royale'],
        isActive: true,
        metaTitle: { en: 'Rose Musk Long Lasting Attar for Women', bn: 'নারীদের জন্য রোজ মাস্ক দীর্ঘস্থায়ী আতর' },
        metaDescription: {
          en: 'Buy premium Rose Musk attar with sweet floral notes and creamy white musk base.',
          bn: 'মিষ্টি ফুলের সুবাস এবং ক্রিমি সাদা কস্তুরীর রোজ মাস্ক আতর কিনুন।'
        },
        faqs: [
          {
            question: { en: 'Can I apply this directly to clothes?', bn: 'এটি কি সরাসরি কাপড়ে ব্যবহার করা যাবে?' },
            answer: {
              en: 'Yes, but for light-colored silk or delicate clothes, we recommend rubbing it in your palms first to avoid staining.',
              bn: 'হ্যাঁ, তবে হালকা রঙের সিল্ক বা সংবেদনশীল কাপড়ের ক্ষেত্রে দাগ এড়াতে প্রথমে হাতের তালুতে ঘষে নেয়ার পরামর্শ দেওয়া হয়।'
            }
          }
        ]
      },
      {
        slug: 'jasmine-noir',
        name: { en: 'Jasmine Noir', bn: 'জুঁই নোয়ার' },
        tagline: { en: 'Night-Blooming Jasmine Essence', bn: 'রাতে ফোটা জুঁই ফুলের নির্যাস' },
        description: {
          en: 'Capturing the deep, mysterious essence of night-blooming jasmine flowers under golden stars, offset by fresh citrus notes.',
          bn: 'সোনালী তারার নিচে রাতে ফোটা জুঁই ফুলের গভীর, রহস্যময় নির্যাস ধারণ করা হয়েছে যা তাজা সাইট্রাস সুবাসের দ্বারা ভারসাম্যপূর্ণ।'
        },
        images: [urlJasmine, urlRose],
        price: 1800,
        badge: { en: 'New Arrival', bn: 'নতুন আগমন' },
        badges: ['New Arrival'],
        notes: {
          top: [{ name: 'Bergamot Citrus', icon: urlBergamot }],
          heart: [{ name: 'Sambac Jasmine', icon: urlJasmine }],
          base: [{ name: 'Sandalwood', icon: urlSandalwood }]
        },
        category: 'unisex',
        collections: ['unisex', 'women', 'attar'],
        sizes: [
          { ml: 3, price: 500, stock: 35, sku: 'JAS-NOR-3ML' },
          { ml: 6, price: 950, stock: 25, sku: 'JAS-NOR-6ML' },
          { ml: 12, price: 1800, stock: 15, sku: 'JAS-NOR-12ML' }
        ],
        rating: 5.0,
        reviewCount: 1,
        pairsWith: ['oud-royale'],
        isActive: true,
        metaTitle: { en: 'Jasmine Noir Floral Attar Oil - Subaashghor', bn: 'জুঁই নোয়ার ফ্লোরাল আতর তেল - সুবাসঘর' },
        metaDescription: {
          en: 'Discover the intense fragrance of night-blooming jasmine blossoms in a pure, alcohol-free blend.',
          bn: 'বিশুদ্ধ, অ্যালকোহল-মুক্ত জুঁই নোয়ার আতরে রাতে ফোটা জুঁই ফুলের তীব্র সুগন্ধ অনুভব করুন।'
        },
        faqs: []
      }
    ];

    const insertedProducts = await ProductModel.insertMany(productsData);
    console.log(`Created ${insertedProducts.length} products.`);

    // 7. Create Reviews
    console.log('Creating reviews...');
    const reviewsData = [
      {
        productId: insertedProducts[0]._id, // Oud Royale
        productSlug: 'oud-royale',
        userId: customerUser._id,
        userName: 'Rahim Uddin',
        userLocation: 'Dhaka',
        rating: 5,
        title: 'Outstanding Cambodian Oud!',
        body: 'The Cambodian Oud in this is top-notch. It stays active on my shirt even after wash. Highly recommended for attar enthusiasts!',
        status: 'published',
        featured: true,
      },
      {
        productId: insertedProducts[0]._id, // Oud Royale
        productSlug: 'oud-royale',
        userId: customerUser2._id,
        userName: 'Nusrat Jahan',
        userLocation: 'Chittagong',
        rating: 4,
        title: 'Deep and long lasting',
        body: 'Very premium woody notes. It opens slightly strong but settles down into a beautiful, calming sweet woody tone. Will purchase again.',
        status: 'published',
        featured: false,
      },
      {
        productId: insertedProducts[1]._id, // Rose Musk
        productSlug: 'rose-musk',
        userId: customerUser._id,
        userName: 'Rahim Uddin',
        userLocation: 'Dhaka',
        rating: 5,
        title: 'My wife loves this!',
        body: 'Sweet floral fragrance, perfect balance of white musk and fresh rose. Extremely pleasing smell.',
        status: 'published',
        featured: true,
      },
      {
        productId: insertedProducts[2]._id, // Jasmine Noir
        productSlug: 'jasmine-noir',
        userId: customerUser2._id,
        userName: 'Nusrat Jahan',
        userLocation: 'Sylhet',
        rating: 5,
        title: 'Pure Juui Flower essence',
        body: 'Smells like fresh Juui flowers at night. Extremely natural. Loved it completely.',
        status: 'published',
        featured: true,
      }
    ];
    await ReviewModel.insertMany(reviewsData);
    console.log(`Created ${reviewsData.length} reviews.`);

    // 8. Create Blog Posts
    console.log('Creating blog posts...');
    const postsData = [
      {
        slug: 'the-art-of-layering-attar',
        title: { en: 'The Ancient Art of Attar Layering', bn: 'আতর লেয়ারিংয়ের প্রাচীন শিল্প' },
        excerpt: {
          en: 'Discover how to combine rose, oud, and sandalwood attars to create your own signature personalized scent profile.',
          bn: 'আপনার নিজস্ব সিগনেচার সুগন্ধি প্রোফাইল তৈরি করতে কীভাবে গোলাপ, উদ এবং চন্দন আতর একত্রিত করবেন তা জানুন।'
        },
        content: {
          en: `Attar layering is a century-old practice that transforms single fragrance notes into complex, rich scent symphonies. By understanding the interaction between different notes, you can create a custom aura that is completely unique to you.

Step 1: Start with the base note. Rich woody bases like Cambodia Oud Royale or pure Sandalwood form the canvas. Apply this on pulse points.
Step 2: Add the heart note. Elegant floral attars like Rose Musk or Jasmine Noir sit beautifully on top of woody bases, cutting through the heavy musk with fresh petals.
Step 3: Keep it light. Fresh citrus top notes like Bergamot can be added to complete the profile.

Experiment with different ratios to find what works best for your body chemistry.`,
          bn: `আতর লেয়ারিং হলো শত বছরের পুরনো একটি চর্চা যা সাধারণ সুগন্ধি নোটগুলোকে জটিল এবং সমৃদ্ধ ঘ্রাণে রূপান্তর করে। বিভিন্ন নোটে কীভাবে পারস্পরিক বিক্রিয়া হয় তা বুঝে আপনি আপনার জন্য সম্পূর্ণ অনন্য একটি সুবাসের বলয় তৈরি করতে পারেন।

ধাপ ১: বেস নোট দিয়ে শুরু করুন। কম্বোডিয়া উদ রয়্যাল বা খাঁটি চন্দন কাঠের মতো সমৃদ্ধ কাঠের বেসগুলো ক্যানভাস হিসেবে কাজ করে। এটি পালস পয়েন্টে লাগান।
ধাপ ২: হার্ট নোট যোগ করুন। রোজ মাস্ক বা জুঁই নোয়ারের মতো চমৎকার ফুলের আতরগুলো কাঠের বেসের ওপর দারুণভাবে বসে এবং তাজা পাপড়ি দিয়ে ভারী সুবাসে সতেজতা আনে।
ধাপ ৩: সুবাস হালকা রাখুন। প্রোফাইলটি সম্পূর্ণ করতে জুঁই বা সাইট্রাসের মতো তাজা টপ নোট যুক্ত করতে পারেন।

আপনার শরীরের রসায়নের সাথে কোনটি সবচেয়ে ভালো কাজ করে তা খুঁজে পেতে বিভিন্ন অনুপাতে চেষ্টা করুন।`
        },
        category: { en: 'Fragrance Guide', bn: 'সুগন্ধি গাইড' },
        cover: urlOud,
        tags: ['layering', 'attar', 'oud', 'rose'],
        author: { name: 'Shanjid Ahmad' },
        date: new Date(),
        readMinutes: 5,
        featured: true,
        published: true,
        metaTitle: { en: 'Complete Guide to Attar Layering - Subaashghor', bn: 'আতর লেয়ারিংয়ের সম্পূর্ণ নির্দেশিকা - সুবাসঘর' },
        metaDescription: {
          en: 'Learn the ancient secrets of blending oud attar with rose musk for a personalized, long-lasting scent signature.',
          bn: 'একটি ব্যক্তিগত ও দীর্ঘস্থায়ী সিগনেচার ঘ্রাণ তৈরি করতে উদ আতরের সাথে রোজ মাস্ক মিশ্রিত করার প্রাচীন রহস্য জানুন।'
        },
        faqs: [
          {
            question: { en: 'Can I layer attar with modern spray perfumes?', bn: 'আমি কি আতরকে আধুনিক স্প্রে পারফিউমের সাথে মেলাতে পারি?' },
            answer: {
              en: 'Yes, apply the attar oil to pulse points first, let it absorb for 5 minutes, and then spray the perfume on top.',
              bn: 'হ্যাঁ, প্রথমে পালস পয়েন্টগুলোতে আতর তেল লাগান, ৫ মিনিট শোষণ করতে দিন এবং তারপরে ওপরে পারফিউম স্প্রে করুন।'
            }
          }
        ]
      },
      {
        slug: 'why-pure-oil-is-better',
        title: { en: 'Why Concentrated Attar Oils Outlast Spray Perfumes', bn: 'কেন ঘনীভূত আতর তেল স্প্রে পারফিউমের চেয়ে দীর্ঘস্থায়ী হয়' },
        excerpt: {
          en: 'A scientific look at how alcohol-free oil formulations interact with your skin compared to alcohol-based spray perfumes.',
          bn: 'অ্যালকোহল-ভিত্তিক স্প্রে পারফিউমের তুলনায় অ্যালকোহল-মুক্ত তেল কীভাবে আপনার ত্বকের সাথে মিশে সে সম্পর্কে একটি বৈজ্ঞানিক দৃষ্টিভঙ্গি।'
        },
        content: {
          en: `Many fragrance lovers wonder why a tiny 3ml bottle of attar can last months, while a massive 100ml bottle of spray perfume empties quickly. The answer lies in the carrier and formulation.

Spray perfumes contain 80% to 90% denatured alcohol. While alcohol helps project the scent initially by evaporating quickly, it also drags the top and heart notes with it, causing the fragrance to fade in 3 to 5 hours.

Attar, on the other hand, uses pure carrier oils (like sandalwood oil or jojoba). Oils do not evaporate; they sink into the skin and release fragrance slowly as your body heat warms up. This guarantees a projection that lasts up to 24 hours.`,
          bn: `অনেক সুগন্ধিপ্রেমী অবাক হন যে কেন একটি ছোট ৩ মিলি আতরের বোতল কয়েক মাস চলতে পারে, যেখানে স্প্রে পারফিউমের একটি বড় ১০০ মিলি বোতল দ্রুত শেষ হয়ে যায়। উত্তরটি লুকিয়ে আছে এর ফর্মুলেশনে।

স্প্রে পারফিউমে ৮০% থেকে ৯০% অ্যালকোহল থাকে। অ্যালকোহল দ্রুত বাষ্পীভূত হয়ে প্রথমে সুবাস ছড়াতে সাহায্য করলেও এটি টপ এবং হার্ট নোটগুলোকে সাথে নিয়ে উড়ে যায়, ফলে ৩ থেকে ৫ ঘণ্টার মধ্যে সুবাস উধাও হয়ে যায়।

অন্যদিকে, আতরে খাঁটি ক্যারিয়ার তেল (যেমন চন্দন তেল বা জোজোবা) ব্যবহৃত হয়। তেল বাষ্পীভূত হয় না; এগুলো ত্বকে মিশে যায় এবং শরীরের উষ্ণতার সাথে সাথে ধীরে ধীরে সুবাস ছড়ায়। এটি ২৪ ঘণ্টা পর্যন্ত সুবাস ধরে রাখে।`
        },
        category: { en: 'Tips & Care', bn: 'টিপস ও যত্ন' },
        cover: urlRose,
        tags: ['attar', 'science', 'oil', 'longevity'],
        author: { name: 'Shanjid Ahmad' },
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        readMinutes: 4,
        featured: false,
        published: true,
        metaTitle: { en: 'Attar vs Spray Perfumes: The Science of Longevity', bn: 'আতর বনাম স্প্রে পারফিউম: দীর্ঘস্থায়ী হওয়ার বিজ্ঞান' },
        metaDescription: {
          en: 'Discover why alcohol-free concentrated oil formulations offer far superior longevity than standard designer spray perfumes.',
          bn: 'জানুন কেন অ্যালকোহল-মুক্ত ঘনীভূত তেলের মিশ্রণগুলো সাধারণ স্প্রে পারফিউমের চেয়ে অনেক বেশি দীর্ঘস্থায়ী সুবাস দেয়।'
        },
        faqs: []
      }
    ];
    await PostModel.insertMany(postsData);
    console.log(`Created ${postsData.length} blog posts.`);

    // 9. Create Coupons
    console.log('Creating coupons...');
    const couponsData = [
      {
        code: 'WELCOME10',
        type: 'percent',
        value: 10,
        minSubtotal: 1000,
        maxDiscount: 500,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        active: true,
      },
      {
        code: 'SUBASH200',
        type: 'flat',
        value: 200,
        minSubtotal: 2000,
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        active: true,
      }
    ];
    await CouponModel.insertMany(couponsData);
    console.log(`Created ${couponsData.length} coupons.`);

    // 10. Create Orders (To build a rich and beautiful analytics dashboard with historic sales charts!)
    console.log('Creating Orders...');
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    const ordersData = [
      // Order 1: 14 days ago - Delivered
      {
        orderNumber: 'SG-1001',
        userId: customerUser._id,
        items: [
          {
            productId: insertedProducts[0]._id,
            slug: 'oud-royale',
            name: 'Oud Royale (6ml)',
            image: urlOud,
            ml: 6,
            price: 1600,
            qty: 1,
          }
        ],
        shipping: {
          name: 'Rahim Uddin',
          phone: '01812345678',
          address: 'House 42, Road 9A, Dhanmondi',
          area: 'Dhanmondi',
          city: 'Dhaka',
          district: 'Dhaka',
          postcode: '1209',
        },
        subtotal: 1600,
        shippingFee: 60,
        discount: 0,
        total: 1660,
        paymentMethod: 'cod',
        paymentStatus: 'paid',
        status: 'delivered',
        createdAt: new Date(now - 14 * oneDay),
      },
      // Order 2: 10 days ago - Delivered
      {
        orderNumber: 'SG-1002',
        userId: customerUser2._id,
        items: [
          {
            productId: insertedProducts[1]._id,
            slug: 'rose-musk',
            name: 'Rose Musk (12ml)',
            image: urlRose,
            ml: 12,
            price: 1990,
            qty: 1,
          },
          {
            productId: insertedProducts[2]._id,
            slug: 'jasmine-noir',
            name: 'Jasmine Noir (3ml)',
            image: urlJasmine,
            ml: 3,
            price: 500,
            qty: 2,
          }
        ],
        shipping: {
          name: 'Nusrat Jahan',
          phone: '01987654321',
          address: 'GEC Circle, Hill View Area',
          area: 'GEC',
          city: 'Chittagong',
          district: 'Chittagong',
          postcode: '4000',
        },
        subtotal: 2990,
        shippingFee: 120,
        discount: 299, // 10% coupon WELCOME10
        couponCode: 'WELCOME10',
        total: 2811,
        paymentMethod: 'bkash',
        paymentStatus: 'paid',
        status: 'delivered',
        createdAt: new Date(now - 10 * oneDay),
      },
      // Order 3: 7 days ago - Shipped
      {
        orderNumber: 'SG-1003',
        userId: customerUser._id,
        items: [
          {
            productId: insertedProducts[0]._id,
            slug: 'oud-royale',
            name: 'Oud Royale (12ml)',
            image: urlOud,
            ml: 12,
            price: 2990,
            qty: 1,
          }
        ],
        shipping: {
          name: 'Rahim Uddin',
          phone: '01812345678',
          address: 'House 42, Road 9A, Dhanmondi',
          area: 'Dhanmondi',
          city: 'Dhaka',
          district: 'Dhaka',
          postcode: '1209',
        },
        subtotal: 2990,
        shippingFee: 60,
        discount: 200, // SUBASH200
        couponCode: 'SUBASH200',
        total: 2850,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        status: 'shipped',
        trackingId: 'STE-998811',
        createdAt: new Date(now - 7 * oneDay),
      },
      // Order 4: 4 days ago - Confirmed
      {
        orderNumber: 'SG-1004',
        userId: customerUser2._id,
        items: [
          {
            productId: insertedProducts[2]._id,
            slug: 'jasmine-noir',
            name: 'Jasmine Noir (12ml)',
            image: urlJasmine,
            ml: 12,
            price: 1800,
            qty: 1,
          }
        ],
        shipping: {
          name: 'Nusrat Jahan',
          phone: '01987654321',
          address: 'GEC Circle, Hill View Area',
          area: 'GEC',
          city: 'Chittagong',
          district: 'Chittagong',
          postcode: '4000',
        },
        subtotal: 1800,
        shippingFee: 120,
        discount: 0,
        total: 1920,
        paymentMethod: 'bkash',
        paymentStatus: 'paid',
        status: 'confirmed',
        createdAt: new Date(now - 4 * oneDay),
      },
      // Order 5: 1 day ago - Pending
      {
        orderNumber: 'SG-1005',
        userId: customerUser._id,
        items: [
          {
            productId: insertedProducts[1]._id,
            slug: 'rose-musk',
            name: 'Rose Musk (6ml)',
            image: urlRose,
            ml: 6,
            price: 1100,
            qty: 1,
          }
        ],
        shipping: {
          name: 'Rahim Uddin',
          phone: '01812345678',
          address: 'House 42, Road 9A, Dhanmondi',
          area: 'Dhanmondi',
          city: 'Dhaka',
          district: 'Dhaka',
          postcode: '1209',
        },
        subtotal: 1100,
        shippingFee: 60,
        discount: 0,
        total: 1160,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        status: 'pending',
        createdAt: new Date(now - 1 * oneDay),
      },
      // Order 6: Today - Pending
      {
        orderNumber: 'SG-1006',
        userId: customerUser2._id,
        items: [
          {
            productId: insertedProducts[0]._id,
            slug: 'oud-royale',
            name: 'Oud Royale (3ml)',
            image: urlOud,
            ml: 3,
            price: 890,
            qty: 1,
          },
          {
            productId: insertedProducts[2]._id,
            slug: 'jasmine-noir',
            name: 'Jasmine Noir (6ml)',
            image: urlJasmine,
            ml: 6,
            price: 950,
            qty: 1,
          }
        ],
        shipping: {
          name: 'Nusrat Jahan',
          phone: '01987654321',
          address: 'GEC Circle, Hill View Area',
          area: 'GEC',
          city: 'Chittagong',
          district: 'Chittagong',
          postcode: '4000',
        },
        subtotal: 1840,
        shippingFee: 120,
        discount: 184, // WELCOME10
        couponCode: 'WELCOME10',
        total: 1776,
        paymentMethod: 'bkash',
        paymentStatus: 'pending',
        status: 'pending',
        createdAt: new Date(now),
      }
    ];

    await OrderModel.insertMany(ordersData);
    console.log(`Created ${ordersData.length} mock orders with historical dates.`);

    // 11. Create Settings (Analytics Pixel & Script Injection - Module 05)
    console.log('Creating Settings...');
    await SettingsModel.create({
      title: 'Subaashghor — House of Pure Fragrance',
      taglineBn: 'একটি বিশুদ্ধ সুবাসের ঐতিহ্য',
      logoUrl: '/assets/logo.svg',
      faviconUrl: '/favicon.ico',
      announcement: 'Free delivery on orders over ৳3,000!',
      whatsapp: '+880 1724 104606',
      email: 'hello@subaashghor.com',
      address: 'House 42, Road 9A, Dhanmondi, Dhaka',
      facebook: 'https://facebook.com/subaashghor',
      instagram: 'https://instagram.com/subaashghor',
      maintenanceMode: false,
      pixels: {
        ga4: 'G-XXXXXXX',
        fbPixel: '1122334455',
        fbCapiToken: 'EAAXXYYZZ...',
        gtm: 'GTM-MNC82SG',
        tiktok: 'TT-XXXXXX',
        clarity: 'CL-XXXXXX',
      },
      scripts: {
        header: `<!-- Google Search Console -->\n<meta name="google-site-verification" content="subaashghor-verify-123456" />\n<!-- Custom global styling override -->\n<style>\n  ::selection { background: #d4af37; color: #1e1e1e; }\n</style>`,
        body: `<!-- Google Tag Manager noscript -->\n<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MNC82SG" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`,
        footer: `<!-- Live WhatsApp Chat Widget -->\n<script>\n  console.log("Subaashghor scripts initialized successfully!");\n</script>`,
      },
      taggingServerUrl: 'https://tagging.subaashghor.com',
      robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://subaashghor.com/sitemap.xml',
    });
    console.log('Global settings seeded.');

    // 12. Create ScentFinder Questions (Scent Discovery - Module 03/08)
    console.log('Creating ScentFinder Questions...');
    const questionsData = [
      {
        id: 'gender',
        prompt: { en: 'Who is this perfume for?', bn: 'সুগন্ধিটি কার জন্য?' },
        options: [
          { value: 'fresh', label: { en: 'Myself (Male)', bn: 'আমার জন্য (পুরুষ)' } },
          { value: 'floral', label: { en: 'Myself (Female)', bn: 'আমার জন্য (নারী)' } },
          { value: 'woody', label: { en: 'A Gift for Him', bn: 'উপহার হিসেবে (পুরুষ)' } },
          { value: 'warm', label: { en: 'A Gift for Her', bn: 'উপহার হিসেবে (নারী)' } },
        ]
      },
      {
        id: 'intensity',
        prompt: { en: 'What kind of intensity do you prefer?', bn: 'আপনি কি ধরনের তীব্রতা পছন্দ করেন?' },
        options: [
          { value: 'fresh', label: { en: 'Light & Airy', bn: 'হালকা ও সতেজ' } },
          { value: 'floral', label: { en: 'Elegant & Sweet Floral', bn: 'মার্জিত ও মিষ্টি ফুলের ঘ্রাণ' } },
          { value: 'woody', label: { en: 'Deep Woody & Strong', bn: 'গভীর কাঠ এবং তীব্র সুবাস' } },
          { value: 'warm', label: { en: 'Warm & Spicy Musk', bn: 'উষ্ণ ও মসলাদার কস্তুরী' } },
        ]
      },
      {
        id: 'occasion',
        prompt: { en: 'When do you plan to wear it?', bn: 'আপনি এটি কখন ব্যবহার করতে চান?' },
        options: [
          { value: 'fresh', label: { en: 'Daily casual wear', bn: 'প্রতিদিনের সাধারণ ব্যবহারে' } },
          { value: 'floral', label: { en: 'Romantic dates', bn: 'রোমান্টিক আড্ডায়' } },
          { value: 'woody', label: { en: 'Formal business/office', bn: 'আনুষ্ঠানিক ব্যবসা/অফিসে' } },
          { value: 'warm', label: { en: 'Evening weddings & religious events', bn: 'সন্ধ্যাবেলার বিয়ের অনুষ্ঠান ও ধর্মীয় উৎসব' } },
        ]
      }
    ];
    await QuestionModel.insertMany(questionsData);
    console.log(`Created ${questionsData.length} ScentFinder questions.`);

    // 13. Redirects & Newsletter
    console.log('Creating Redirects & Subscribers...');
    await RedirectModel.create({
      from: '/old-shop-url',
      to: '/shop',
      statusCode: 301,
      note: 'Redirecting deprecated URL to main store page.',
    });
    
    await NewslatterModel.create({
      email: 'subscriber1@yahoo.com',
      active: true,
    });
    console.log('Demo redirects and newsletter subscribers seeded.');

    console.log('----------------------------------------------------');
    console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('----------------------------------------------------');

  } catch (error) {
    console.error('Seeding failed with error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Mongoose disconnected.');
  }
};

seed();
