import { Schema, model, Document } from 'mongoose';

export interface INotifyMe extends Document {
  productId: string;
  sizeMl: number;
  email: string;
  fulfilledAt?: Date;
  createdAt: Date;
}

const notifyMeSchema = new Schema<INotifyMe>(
  {
    productId: { type: String, required: true },
    sizeMl: { type: Number, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    fulfilledAt: Date,
  },
  { timestamps: true },
);

notifyMeSchema.index({ productId: 1, sizeMl: 1, email: 1 }, { unique: true });

export const NotifyMeModel = model<INotifyMe>('NotifyMe', notifyMeSchema);
