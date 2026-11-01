import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { createApp } from './app.factory';
import { env } from './config/env';

async function bootstrap() {
  // Local development reads .env; hosted environments set real variables. (env() is read lazily.)
  if (existsSync('.env')) process.loadEnvFile('.env');
  const app = await createApp();
  await app.listen(env().PORT);
  console.log(`SPARKODERS API on http://localhost:${env().PORT}`);
}

void bootstrap();
