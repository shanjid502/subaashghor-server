import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  port: process.env.PORT ?? 5000,
  databaseUrl: process.env.DATABASE_URL as string,
  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS) ?? 12,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET as string,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN ?? '30d',
  jwt_reset_secret: process.env.JWT_RESET_SECRET as string,
  jwt_reset_expires_in: process.env.JWT_RESET_EXPIRES_IN ?? '15m',
  client_url: process.env.CLIENT_URL ?? 'http://localhost:5173',
  resend_api_key: process.env.RESEND_API_KEY as string,
  smtp_host: process.env.SMTP_HOST as string,
  smtp_port: Number(process.env.SMTP_PORT) ?? 587,
  smtp_user: process.env.SMTP_USER as string,
  smtp_pass: process.env.SMTP_PASS as string,
  from_email: process.env.FROM_EMAIL ?? 'noreply@subaashghor.com',
  free_shipping_threshold: Number(process.env.FREE_SHIPPING_THRESHOLD) || 3000,
  shipping_fee: Number(process.env.SHIPPING_FEE) || 130,
};
