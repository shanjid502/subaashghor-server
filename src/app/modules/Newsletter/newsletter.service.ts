import { NewsletterModel } from './newsletter.model';
import { dispatchWebhook } from '../../utils/webhookDispatcher';
import { generateEventId } from '../../utils/eventId';
import { syncToMailchimp } from '../../utils/mailchimpSync';

const subscribe = async (email: string) => {
  const cleanEmail = email.trim().toLowerCase();
  let subscriber = await NewsletterModel.findOne({ email: cleanEmail });
  if (!subscriber) {
    subscriber = await NewsletterModel.create({ email: cleanEmail });
  }

  setImmediate(async () => {
    const eventId = generateEventId();
    await dispatchWebhook('newsletter.subscribed', {
      eventId,
      email: cleanEmail,
      subscribedAt: subscriber!.subscribedAt,
    });
    await syncToMailchimp(cleanEmail);
  });

  return subscriber;
};

export const NewsletterService = {
  subscribe,
};
