import type { Locale } from '@/lib/i18n/routing';
import type { Messages } from '@/messages';

declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
  }
}
