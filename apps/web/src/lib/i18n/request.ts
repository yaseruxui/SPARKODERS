import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { getCms, setPath } from '@/lib/cms';
import { loadMessages } from '@/messages';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  // Bundled copy, with the texts edited in the dashboard laid over it.
  const [bundled, cms] = await Promise.all([loadMessages(locale), getCms()]);
  const overrides = cms?.texts[locale];
  const messages = overrides && Object.keys(overrides).length ? structuredClone(bundled) : bundled;
  if (overrides) for (const [key, value] of Object.entries(overrides)) setPath(messages as unknown as Record<string, unknown>, key, value);

  return {
    locale,
    messages,
    timeZone: 'Asia/Riyadh',
  };
});
