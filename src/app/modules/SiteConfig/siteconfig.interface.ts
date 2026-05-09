import { Document } from 'mongoose';

export interface ISiteConfig extends Document {
  key: string;
  value: unknown;
  updatedAt: Date;
  createdAt: Date;
}
