import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import logger from './app/utils/logger';
import { cemWelcomePage } from './app/utils/welcomePage';
import cookieParser from 'cookie-parser';
import { globalRateLimiter } from './app/middlewares/rateLimiter.middleware';
import router from './app/routes';
import notFound from './app/middlewares/notFound.middleware';
import globalErrorHandler from './app/middlewares/globalErrorHandler.middleware';

import config from './app/config';

const app: Application = express();

// ── Global Middlewares ────────────────────────────────────────────────────────
app.set('trust proxy', 1);

// 7.2 Gzip compression — compresses all text/html/json responses
app.use(compression({ level: 6, threshold: 1024 }));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(
  cors({
    origin: config.cors_origin ? config.cors_origin.split(',') : true,
    credentials: true,
  }),
);
app.use(globalRateLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Root ──────────────────────────────────────────────────────────────────────
app.get('/', (_req: Request, res: Response): void => {
  res.setHeader('Content-Type', 'text/html');
  res.send(cemWelcomePage());
});

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response): void => {
  const uptime = process.uptime();
  const timestamp = new Date().toISOString();
  logger.info(`Health check called — uptime: ${uptime.toFixed(2)}s`);
  res.status(200).json({
    status: 'ok',
    uptime: parseFloat(uptime.toFixed(2)),
    timestamp,
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/v1', router);

// ── Error Handlers (must be last) ────────────────────────────────────────────
app.use(notFound);
app.use(globalErrorHandler);

export default app;
