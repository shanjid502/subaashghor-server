import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  port: process.env.PORT ?? 5000,
  databaseUrl: process.env.DATABASE_URL as string,
  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  cors_origin: process.env.CORS_ORIGIN,
  bcrypt_rounds: process.env.BCRYPT_ROUNDS,
  password_reset_secret: process.env.PASSWORD_RESET_SECRET,
  password_reset_secret_expires_in: process.env.PASSWORD_RESET_SECRET_EXPIRES_IN,
};