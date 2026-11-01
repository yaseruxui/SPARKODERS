import { z } from 'zod';

const isLocalHttp = (value: string) => /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(value);

const serverSchema = z.object({
  // HTTPS only; plain http is accepted for a localhost receiver outside production.
  CONTACT_WEBHOOK_URL: z
    .url()
    .refine((value) => value.startsWith('https://') || (process.env.NODE_ENV !== 'production' && isLocalHttp(value)), {
      message: 'CONTACT_WEBHOOK_URL must use https',
    })
    .optional(),
  /** Sent as the x-contact-key header; must equal the API's CONTACT_WEBHOOK_KEY (apps/api). */
  CONTACT_WEBHOOK_KEY: z.string().min(8).optional(),
  /** Four digits that unlock the private site. Unset (with the secret) → the site is public. */
  SITE_PASSWORD: z
    .string()
    .regex(/^\d{4}$/, { message: 'SITE_PASSWORD must be exactly four digits' })
    .optional(),
  /** Random string (≥ 32 chars) that signs the unlock cookie so it cannot be forged. */
  SITE_GATE_SECRET: z.string().min(32).optional(),
});

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default('https://sparkoders.com'),
  /**
   * `thmanyah` switches headings and text to Thmanyah Sans. Only enable it where the licensed files
   * are installed in public/fonts/thmanyah/ and Thmanyah has approved web use.
   */
  NEXT_PUBLIC_BRAND_FONT: z.enum(['default', 'thmanyah']).default('default'),
});

const emptyToUndefined = (value: string | undefined): string | undefined =>
  value === undefined || value.trim() === '' ? undefined : value;

export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SITE_URL: emptyToUndefined(process.env.NEXT_PUBLIC_SITE_URL),
  NEXT_PUBLIC_BRAND_FONT: emptyToUndefined(process.env.NEXT_PUBLIC_BRAND_FONT),
});

export function getServerEnv(): z.infer<typeof serverSchema> {
  return serverSchema.parse({
    CONTACT_WEBHOOK_URL: emptyToUndefined(process.env.CONTACT_WEBHOOK_URL),
    CONTACT_WEBHOOK_KEY: emptyToUndefined(process.env.CONTACT_WEBHOOK_KEY),
    SITE_PASSWORD: emptyToUndefined(process.env.SITE_PASSWORD),
    SITE_GATE_SECRET: emptyToUndefined(process.env.SITE_GATE_SECRET),
  });
}

export const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');

export const brandFont = publicEnv.NEXT_PUBLIC_BRAND_FONT;
