import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().default(4000),
  DATABASE_URL: z.string().min(1),
  /** Origin of the admin dashboard; the only origin allowed to call authenticated routes. */
  ADMIN_URL: z.url().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  /** Shared with the site's contact webhook (sent as the x-contact-key header). */
  CONTACT_WEBHOOK_KEY: z.string().min(8),
  /** `none` when the admin and API live on different sites (then the cookie is also Secure). */
  COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  SESSION_DAYS: z.coerce.number().int().min(1).max(90).default(14),
  /** This API's public origin; media URLs are built from it. */
  PUBLIC_URL: z.url().default('http://localhost:4000'),
  /** Where uploaded media is written (served at {PUBLIC_URL}/uploads/…). */
  UPLOADS_DIR: z.string().default('uploads'),
  /** The public site: revalidated after every save, and the source of the one-time content import. */
  SITE_URL: z.url().default('http://localhost:3000'),
  /** Shared with the site's REVALIDATE_SECRET (header x-revalidate-secret). Empty → no revalidation. */
  SITE_REVALIDATE_SECRET: z.string().default(''),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/** Validated environment, read once. Fails fast with a readable message. */
export function env(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}
