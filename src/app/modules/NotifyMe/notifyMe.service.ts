import { NotifyMeModel } from './notifyMe.model';

const subscribe = async (payload: {
  productId: string;
  sizeMl: number;
  email: string;
}) => {
  await NotifyMeModel.findOneAndUpdate(
    {
      productId: payload.productId,
      sizeMl: payload.sizeMl,
      email: payload.email.toLowerCase(),
    },
    payload,
    { upsert: true },
  );
  return { ok: true };
};

export const NotifyMeService = { subscribe };
