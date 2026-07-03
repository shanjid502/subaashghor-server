export interface ISize {
  ml: number;
  price: number;
  salePrice?: number;
  stock: number;
  sku?: string;
}

export interface INoteItem {
  name: string;
  icon?: string;
}

export interface IProduct {
  _id?: string;
  slug: string;
  name: { bn: string; en: string };
  tagline: { bn: string; en: string };
  description?: { bn: string; en: string };
  images: string[];
  price: number;
  salePrice?: number;
  saleEndsAt?: Date;
  badge?: { bn: string; en: string };
  badges?: string[];
  notes: {
    top: INoteItem[];
    heart: INoteItem[];
    base: INoteItem[];
  };
  category: 'men' | 'women' | 'attar' | 'unisex';
  collections: string[];
  sizes: ISize[];
  rating?: number;
  reviewCount?: number;
  pairsWith?: string[];
  isActive?: boolean;
  lowStockThreshold?: number;

  // --- Module 08: AEO/SEO Readiness ---
  metaTitle?: { bn: string; en: string };
  metaDescription?: { bn: string; en: string };
  faqs?: {
    question: { bn: string; en: string };
    answer: { bn: string; en: string };
  }[];
}

export interface IFaq {
  question: { bn: string; en: string };
  answer: { bn: string; en: string };
}
