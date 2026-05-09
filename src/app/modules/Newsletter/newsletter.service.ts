import { SubscriberModel, LeadModel } from './newsletter.model';
import { CouponModel } from '../Coupon/coupon.model';

const subscribe = async (email: string) => {
  // Idempotent — no error on duplicate
  await SubscriberModel.findOneAndUpdate(
    { email: email.toLowerCase() },
    { email: email.toLowerCase(), subscribedAt: new Date() },
    { upsert: true },
  );
  return { email };
};

const captureLead = async (payload: {
  name?: string;
  email: string;
  source?: string;
  answers?: Record<string, string>;
}) => {
  // Find or create a welcome coupon
  const couponCode = 'WELCOME10';
  await CouponModel.findOneAndUpdate(
    { code: couponCode },
    {
      code: couponCode,
      type: 'percent',
      value: 10,
      active: true,
    },
    { upsert: true },
  );

  await LeadModel.create({
    ...payload,
    couponCode,
    source: payload.source ?? 'scent-finder',
  });

  return { couponCode };
};

export const NewsletterService = { subscribe, captureLead };
