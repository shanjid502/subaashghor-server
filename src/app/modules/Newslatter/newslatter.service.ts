import { NewslatterModel } from './newslatter.model';
import { syncToMailchimp } from '../../utils/mailchimpSync';

const subscribe = async (email: string) => {
  const cleanEmail = email.trim().toLowerCase();

  // Idempotent: return existing subscription if duplicate
  let subscriber = await NewslatterModel.findOne({ email: cleanEmail });
  if (!subscriber) {
    subscriber = await NewslatterModel.create({ email: cleanEmail });
    // 5.4 Sync to Mailchimp audience (async, never blocks response)
    setImmediate(() => syncToMailchimp(cleanEmail));
  }

  return {
    email: subscriber.email,
  };
};

export const NewslatterService = {
  subscribe,
};

