import { z } from 'zod';

/** Services a visitor can tick on the site's contact form. */
export const INTEREST_KEYS = ['website', 'store', 'app', 'branding', 'seo', 'ai'] as const;
export type InterestKey = (typeof INTEREST_KEYS)[number];

const trimmed = (max: number) => z.string().trim().max(max);

/** What the site's contact form sends, after its own validation. */
export const contactPayloadSchema = z.object({
  name: trimmed(120).min(2),
  organisation: trimmed(160).min(2),
  email: z.email().max(200),
  phone: trimmed(40).optional(),
  interests: z.array(z.enum(INTEREST_KEYS)).max(INTEREST_KEYS.length).default([]),
  message: trimmed(4000).optional(),
});
export type ContactPayload = z.infer<typeof contactPayloadSchema>;

/**
 * The envelope the site POSTs to `{API}/public/contact` (its CONTACT_WEBHOOK_URL).
 * `locale` tells the inbox which language the visitor used.
 */
export const contactSubmissionSchema = z.object({
  kind: z.literal('contact'),
  submittedAt: z.iso.datetime(),
  locale: z.enum(['ar', 'en']).optional(),
  payload: contactPayloadSchema,
});
export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;

/** Where an enquiry stands in the inbox. */
export const MESSAGE_STATUSES = ['new', 'in_progress', 'replied', 'closed', 'spam'] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];
