import { NewslatterModel } from './newslatter.model';

const subscribe = async (email: string) => {
  const cleanEmail = email.trim().toLowerCase();

  // Idempotent: return existing subscription if duplicate
  let subscriber = await NewslatterModel.findOne({ email: cleanEmail });
  if (!subscriber) {
    subscriber = await NewslatterModel.create({ email: cleanEmail });
  }

  return {
    email: subscriber.email,
  };
};

export const NewslatterService = {
  subscribe,
};
