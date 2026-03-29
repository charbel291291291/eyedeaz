import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { createServer as createViteServer } from 'vite';
import { env } from './config/env';
import { ensureSession } from './lib/session';
import { createApiRateLimit } from './lib/rate-limit';
import { sendApiError } from './lib/responses';
import { aiRouter } from './routes/ai';
import { leadsRouter } from './routes/leads';
import { trackRouter } from './routes/track';

type RateLimitConfig = {
  windowMs: number;
  max: number;
};

type CreateAppOptions = {
  serveClient?: boolean;
  rateLimits?: {
    leads?: RateLimitConfig;
    ai?: RateLimitConfig;
    track?: RateLimitConfig;
  };
};

export async function createApp(options: CreateAppOptions = {}) {
  const app = express();
  const serveClient = options.serveClient ?? true;
  const isDev = !env.isProduction;
  const leadRateLimit = options.rateLimits?.leads ?? { windowMs: 15 * 60 * 1000, max: 10 };
  const aiRateLimit = options.rateLimits?.ai ?? { windowMs: 15 * 60 * 1000, max: 8 };
  const trackRateLimit = options.rateLimits?.track ?? { windowMs: 15 * 60 * 1000, max: 120 };

  app.set('trust proxy', 1);
  app.use(
    helmet({
      contentSecurityPolicy: isDev
        ? false
        : {
            directives: {
              defaultSrc: ["'self'"],
              connectSrc: ["'self'"],
              imgSrc: ["'self'", 'data:'],
              styleSrc: ["'self'", "'unsafe-inline'"],
              scriptSrc: ["'self'"],
              fontSrc: ["'self'"],
              objectSrc: ["'none'"],
              baseUri: ["'self'"],
              formAction: ["'self'"],
              frameAncestors: ["'none'"],
            },
          },
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  );
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || env.allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error('Origin is not allowed by CORS.'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
    }),
  );
  app.use(express.json({ limit: '64kb' }));
  app.use(ensureSession);

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use('/api/leads', createApiRateLimit(leadRateLimit.windowMs, leadRateLimit.max), leadsRouter);
  app.use('/api/ai', createApiRateLimit(aiRateLimit.windowMs, aiRateLimit.max), aiRouter);
  app.use('/api/track', createApiRateLimit(trackRateLimit.windowMs, trackRateLimit.max), trackRouter);

  if (!serveClient) {
    // API-only mode for tests.
  } else if (isDev) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: env.PORT,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      try {
        const rawTemplate = await readFile(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        const template = await vite.transformIndexHtml(req.originalUrl, rawTemplate);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (error) {
        vite.ssrFixStacktrace(error as Error);
        next(error);
      }
    });
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');

    app.use(express.static(distPath));
    app.use('*', async (_req, res, next) => {
      try {
        const html = await readFile(path.join(distPath, 'index.html'), 'utf-8');
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (error) {
        next(error);
      }
    });
  }

  app.use((error: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    void next;

    if (error.message.includes('CORS')) {
      sendApiError(res, 403, 'forbidden_origin', 'This origin is not allowed.');
      return;
    }

    console.error('Unhandled server error:', error);
    sendApiError(res, 500, 'server_error', 'Something went wrong on our side.');
  });

  return app;
}

async function start() {
  const app = await createApp();

  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`eyedeaz server ready at http://localhost:${env.PORT}`);
  });
}

if (!process.env.VITEST) {
  start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}
