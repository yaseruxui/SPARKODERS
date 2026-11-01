'use server';

import { getLocale } from 'next-intl/server';
import { isRequestUnlocked } from '@/lib/site-gate-server';
import { deliverToWebhook } from '@/services/webhook-delivery';
import { contactFormToObject, contactSchema } from '../schemas/contact';
import type { FormStatus } from '../types';

function toStatus(result: Awaited<ReturnType<typeof deliverToWebhook>>): FormStatus {
  if (result === 'delivered') return { status: 'success' };
  if (result === 'unconfigured') return { status: 'unconfigured' };
  return { status: 'failed' };
}

export async function submitContact(_previous: FormStatus, form: FormData): Promise<FormStatus> {
  if (!(await isRequestUnlocked())) return { status: 'failed' };
  const parsed = contactSchema.safeParse(contactFormToObject(form));
  if (!parsed.success) {
    return { status: 'invalid', fields: [...new Set(parsed.error.issues.map((issue) => String(issue.path[0])))] };
  }
  const { name, organisation, email, phone, interests, message } = parsed.data;
  const locale = await getLocale();
  return toStatus(
    await deliverToWebhook(
      { name, organisation, email, phone, interests, message },
      locale === 'en' ? 'en' : 'ar',
    ),
  );
}
