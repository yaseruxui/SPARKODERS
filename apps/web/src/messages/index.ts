import type { Locale } from '@/lib/i18n/routing';
import type ar from './ar';

/** Arabic is the source dictionary; every other locale must match its shape exactly. */
export type Messages = typeof ar;

const loaders: Record<Locale, () => Promise<{ default: Messages }>> = {
  ar: () => import('./ar'),
  en: () => import('./en'),
};

export async function loadMessages(locale: Locale): Promise<Messages> {
  return (await loaders[locale]()).default;
}
