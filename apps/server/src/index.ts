import './config/env'; // Validate env first
import path from 'path';
import fs from 'fs';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { redis } from './config/redis';
import { prisma } from './config/prisma';
import { createSocketServer } from './socket/socket-server';
import { startTickEngine, setSocketIo } from './tick/tick-engine';

import { authRouter } from './routes/auth.routes';
import { laborRouter } from './routes/labor.routes';
import { regionRouter } from './routes/region.routes';
import { mercenaryRouter } from './routes/mercenary.routes';
import { newsRouter } from './routes/news.routes';
import { marketRouter } from './routes/market.routes';
import { travelRouter } from './routes/travel.routes';
import { armyRouter } from './routes/army.routes';
import { npcRouter } from './routes/npc.routes';

async function main() {
  // Redis — warn but don't crash if unavailable during development
  try {
    await redis.connect();
  } catch (err) {
    console.warn('⚠️  Redis bağlanamadı (sohbet/cache devre dışı):', (err as Error).message);
  }

  const app = express();
  const httpServer = http.createServer(app);

  const isProd = env.NODE_ENV === 'production';

  // ─── Middleware ──────────────────────────────────────────────────────────
  app.use(helmet({ contentSecurityPolicy: false }));
  // In production frontend is served from the same origin, CORS only for dev
  app.use(cors({
    origin: isProd ? false : env.CLIENT_URL,
    credentials: true,
  }));
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan(isProd ? 'combined' : 'dev'));

  // Global rate limiter
  app.use(
    rateLimit({
      windowMs: 1 * 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Çok fazla istek. Lütfen bekleyin.' },
    }),
  );

  // ─── API Routes ──────────────────────────────────────────────────────────
  app.use('/api/auth', authRouter);
  app.use('/api/labor', laborRouter);
  app.use('/api/regions', regionRouter);
  app.use('/api/mercenaries', mercenaryRouter);
  app.use('/api/news', newsRouter);
  app.use('/api/market', marketRouter);
  app.use('/api/travel', travelRouter);
  app.use('/api/army', armyRouter);
  app.use('/api/npc', npcRouter);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // ─── Static Frontend (Production) ────────────────────────────────────────
  // In prod: Express serves the Vite build and handles SPA routing
  // Path from dist/index.js → ../../client/dist
  const clientDist = path.resolve(__dirname, '../../client/dist');
  if (isProd && fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    // SPA catch-all: send index.html for any non-API route
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  } else if (!isProd) {
    // Development 404 for API routes
    app.use((_req, res) => {
      res.status(404).json({ error: 'Sayfa bulunamadı' });
    });
  }

  // ─── Socket.io ───────────────────────────────────────────────────────────
  const io = createSocketServer(httpServer);
  setSocketIo(io);

  // ─── Start (before tick engine so healthcheck passes immediately) ─────────
  await new Promise<void>((resolve) =>
    httpServer.listen(env.PORT, '0.0.0.0', () => {
      console.log(`\n⚔️  Kılıç ve Kantar sunucusu çalışıyor`);
      console.log(`   http://0.0.0.0:${env.PORT}`);
      console.log(`   Ortam: ${env.NODE_ENV}\n`);
      resolve();
    }),
  );

  // ─── Tick Engine (non-blocking, started after server is up) ──────────────
  startTickEngine().catch((err) => {
    console.warn('⚠️  Tick engine başlatılamadı (Redis gerekli):', (err as Error).message);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM alındı, kapatılıyor...');
    await prisma.$disconnect();
    try { await redis.quit(); } catch { /* already disconnected */ }
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('Sunucu başlatılamadı:', err);
  process.exit(1);
});
