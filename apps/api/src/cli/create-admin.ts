import 'reflect-metadata';
import * as argon2 from 'argon2';
import { existsSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Creates the first full admin, or resets an admin's password:
 *   npm run admin:create -- you@example.com "Your Name"
 * Asks for the password (or reads ADMIN_PASSWORD). There is no public sign-up.
 */
async function main() {
  if (existsSync('.env')) process.loadEnvFile('.env');
  const prisma = new PrismaService();

  const email = (process.argv[2] ?? process.env.ADMIN_EMAIL ?? '').trim().toLowerCase();
  const name = process.argv[3] ?? 'SPARKODERS Admin';
  if (!email.includes('@')) throw new Error('Usage: npm run admin:create -- you@example.com "Name"');

  let password = process.env.ADMIN_PASSWORD ?? '';
  if (!password) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    password = await rl.question('Password (min 8 characters): ');
    rl.close();
  }
  if (password.length < 8) throw new Error('The password must be at least 8 characters.');

  const passwordHash = await argon2.hash(password);
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name, passwordHash, permissions: Prisma.DbNull },
    update: { passwordHash, permissions: Prisma.DbNull, tokenVersion: { increment: 1 } },
  });
  console.log(`Admin ready: ${user.email}`);
  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
