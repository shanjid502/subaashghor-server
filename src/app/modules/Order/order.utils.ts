import { OrderModel } from './order.model';

export const generateOrderNumber = async (): Promise<string> => {
  const max = 999999;
  const min = 100000;
  let orderNumber: string;
  let exists = true;
  do {
    const digits = Math.floor(Math.random() * (max - min + 1)) + min;
    orderNumber = `SG-${digits}`;
    exists = !!(await OrderModel.findOne({ orderNumber }));
  } while (exists);
  return orderNumber;
};
