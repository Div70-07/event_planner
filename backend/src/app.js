import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import healthRouter from './routes/health.js';
import planRouter from './routes/plan.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Trust Render's reverse proxy for client IP detection
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS — allow-list from environment
// CORS is only needed during local development.
// Production frontend and API share the same origin.
if (!env.isProduction) {
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || env.corsOrigin.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
    })
  );
}

// Body parsing — hard limit 10 KB
app.use(express.json({ limit: '10kb' }));

// gzip compression
app.use(compression());

// API Routes
app.use('/api', healthRouter);
app.use('/api', planRouter);

// Static frontend serving in production (single live URL deployment)
if (env.isProduction) {
  const distPath = path.resolve(__dirname, '../../frontend/dist');
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 404 Handler for unmatched API routes
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
      details: [],
    },
  });
});

// Central Error Handler
app.use(errorHandler);

export { app };
