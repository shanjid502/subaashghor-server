import mongoose from 'mongoose';
import { OrderModel } from '../src/app/modules/Order/order.model';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  await mongoose.connect(process.env.DATABASE_URL as string);
  console.log('DB connected.');

  const orders = await OrderModel.find({}).lean();
  console.log(`Total orders in DB: ${orders.length}`);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const salesByDay = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayName = daysOfWeek[d.getDay()];
    const dateStr = d.toISOString().split("T")[0];

    const dayOrders = orders.filter((o: any) => {
      if (!o.createdAt) return false;
      const orderDate = new Date(o.createdAt);
      return (
        orderDate.getFullYear() === d.getFullYear() &&
        orderDate.getMonth() === d.getMonth() &&
        orderDate.getDate() === d.getDate()
      );
    });

    console.log(`Day: ${dayName} (${d.toLocaleDateString()}) -> matches: ${dayOrders.length}`);
    return {
      day: dayName,
      orders: dayOrders.length,
    };
  });

  await mongoose.disconnect();
}

run();
