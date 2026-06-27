import { Schema, model } from 'mongoose';

export interface ICollection {
  _id?: string;
  slug: string;
  name: { bn: string; en: string };
  description?: { bn: string; en: string };
  cover?: string;
  order?: number;
  isActive?: boolean;
}

const collectionSchema = new Schema<ICollection>(
  {
    slug: { type: String, unique: true, required: true, lowercase: true, index: true },
    name: {
      bn: { type: String, required: true },
      en: { type: String, required: true },
    },
    description: {
      bn: String,
      en: String,
    },
    cover: String,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret: any) => {
        ret._id = String(ret._id);
        delete ret.id;
        return ret;
      },
    },
  },
);

export const CollectionModel = model<ICollection>('Collection', collectionSchema);
