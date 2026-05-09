import { Document } from 'mongoose';
import { IBilingual } from '../Product/product.interface';

export interface IPost extends Document {
  title: IBilingual;
  slug: string;
  content: IBilingual;
  image?: string;
  author: string;
  tags: string[];
  isPublished: boolean;
  date: Date;
}
