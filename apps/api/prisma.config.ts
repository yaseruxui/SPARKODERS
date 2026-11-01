import { existsSync } from 'node:fs';
import { defineConfig, env } from 'prisma/config';

// Prisma 7 no longer reads .env by itself; Node's loader does (hosted environments set real variables).
if (existsSync('.env')) process.loadEnvFile('.env');

/**
 * Development uses a local SQLite file (DATABASE_URL="file:./prisma/dev.db").
 * To move to Postgres: set provider = "postgresql" in schema.prisma, point DATABASE_URL at the
 * server and swap the adapter in src/prisma/prisma.service.ts (@prisma/adapter-pg).
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
});
