import https from 'https';
import http from 'http';

// Force IPv4 for all HTTP/HTTPS outgoing requests to prevent NAT64/IPv6 connection timeouts
(https.globalAgent as any).options = (https.globalAgent as any).options || {};
(https.globalAgent as any).options.family = 4;
(http.globalAgent as any).options = (http.globalAgent as any).options || {};
(http.globalAgent as any).options.family = 4;

import mongoose from 'mongoose';
import app from './app';
import config from './app/config';
import { seedSuperAdmin } from './app/utils/seedSuperAdmin';
import { ScentFinderService } from './app/modules/ScentFinder/scentfinder.service';
import { ReviewModel } from './app/modules/Review/review.model';

async function bootstrap() {
  try {
    await mongoose.connect(config.databaseUrl);
    console.log('✅ MongoDB connected');

    try {
      await ReviewModel.syncIndexes();
      console.log('✅ Review indexes cleaned & synchronized');
    } catch (indexError) {
      console.error('⚠️ Failed to sync Review indexes:', indexError);
    }

    // Seed super admin account if not present
    await seedSuperAdmin();

    // Seed default Scent Finder questions if not present
    await ScentFinderService.seedDefaultQuestions();

    app.listen(config.port, () => {
      config.NODE_ENV === 'development' &&
        console.log(`🚀 Server running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

bootstrap();
