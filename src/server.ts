import mongoose from 'mongoose';
import app from './app';
import config from './app/config';
import { seedSuperAdmin } from './app/utils/seedSuperAdmin';

async function bootstrap() {
  try {
    await mongoose.connect(config.databaseUrl);
    console.log('✅ MongoDB connected');

    // Seed super admin account if not present
    await seedSuperAdmin();

    app.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

bootstrap();
