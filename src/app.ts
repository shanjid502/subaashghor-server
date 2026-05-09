import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import router from './app/routes';
import notFound from './app/middlewares/notFound';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import config from './app/config';

const app: Application = express();

// ── Global Middlewares ────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: [config.client_url, 'http://localhost:5173', 'https://subaashghor.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/v1', router);

// ── Error Handlers (must be last) ────────────────────────────────────────────
app.use(notFound);
app.use(globalErrorHandler);

export default app;
