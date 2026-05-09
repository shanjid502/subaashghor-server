import { Document } from 'mongoose';

export interface IBilingual {
  en: string;
  bn: string;
}

export interface ISize {
  ml: number;
  price: number;
  salePrice?: number;
  stock: number;
}

export interface IProduct extends Document {
  name: IBilingual;
  tagline: IBilingual;
  description: IBilingual;
  slug: string;
  category: string;
  collections: string[];
  images: string[];
  sizes: ISize[];
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}
