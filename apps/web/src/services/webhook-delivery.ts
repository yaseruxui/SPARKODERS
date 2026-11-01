import 'server-only';
import type { ContactSubmission } from '@sparkoders/contracts';
import { getServerEnv } from '@/lib/env';

export type DeliveryResult = 'delivered' | 'unconfigured' | 'failed';

/**
 * POSTs a contact submission to the dashboard API ({API}/public/contact), in the shape the shared
 * contract defines, with the shared key header. Never throws.
 */
export async function deliverToWebhook(
  payload: ContactSubmission['payload'],
  locale: ContactSubmission['locale'],
): Promise<DeliveryResult> {
  const { CONTACT_WEBHOOK_URL, CONTACT_WEBHOOK_KEY } = getServerEnv();
  if (!CONTACT_WEBHOOK_URL) return 'unconfigured';

  const body: ContactSubmission = { kind: 'contact', submittedAt: new Date().toISOString(), locale, payload };
  try {
    const response = await fetch(CONTACT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(CONTACT_WEBHOOK_KEY ? { 'x-contact-key': CONTACT_WEBHOOK_KEY } : {}) },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store',
    });
    return response.ok ? 'delivered' : 'failed';
  } catch {
    return 'failed';
  }
}
