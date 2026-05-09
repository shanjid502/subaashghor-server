import { Document } from 'mongoose';
import { IBilingual } from '../Product/product.interface';

export interface ICollection extends Document {
  name: IBilingual;
  slug: string;
  image?: string;
  description?: IBilingual;
  isActive: boolean;
}
