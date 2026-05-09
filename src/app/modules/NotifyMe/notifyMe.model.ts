import { Schema, model } from 'mongoose';
import { INotifyMe } from './notifyMe.interface';

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
