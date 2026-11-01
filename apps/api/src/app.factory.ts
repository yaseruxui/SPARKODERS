import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { CLIENT_HEADER } from './auth/auth.guard';
import { env } from './config/env';
import { uploadsRoot } from './media/media.service';

/** Builds the configured app (shared by main.ts and the tests). */
export async function createApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: ['error', 'warn', 'log'] });
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(cookieParser());
  // Only the dashboard may call the API from a browser, with its session cookie.
  app.enableCors({
    origin: env().ADMIN_URL,
    credentials: true,
    allowedHeaders: ['content-type', CLIENT_HEADER],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });
  // Uploaded media, public and long-cached (file names are random and never reused).
  app.useStaticAssets(uploadsRoot(), {
    prefix: '/uploads/',
    immutable: true,
    maxAge: '365d',
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
  });
  app.enableShutdownHooks();
  return app;
}
