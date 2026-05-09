import { Schema, model } from 'mongoose';
import { ISubscriber, ILead } from './newsletter.interface';

const subscriberSchema = new Schema<ISubscriber>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  subscribedAt: { type: Date, default: Date.now },
});

export const SubscriberModel = model<ISubscriber>('Subscriber', subscriberSchema);

const leadSchema = new Schema<ILead>(
  {
    name: String,
    email: { type: String, required: true, lowercase: true, trim: true },
    source: { type: String, default: 'scent-finder' },
    answers: { type: Schema.Types.Mixed },
    couponCode: String,
  },
  { timestamps: true },
);

export const LeadModel = model<ILead>('Lead', leadSchema);
