import type { navSections } from '@/lib/config/navigation';
import { getPathname } from './navigation';
import type { Locale } from './routing';

/** Locale-prefixed URL of a page, e.g. `/ar/work/clinic`. */
export function localePath(locale: Locale, href: string): string {
  return getPathname({ href, locale });
}

export const routes = {
  services: '/services',
  about: '/about',
  contact: '/contact',
  privacy: '/privacy',
  work: '/work',
  project: (slug: string) => `/work/${slug}`,
  blog: '/blog',
  post: (slug: string) => `/blog/${slug}`,
} as const;

/** Where a menu entry points. */
export function navHref(locale: Locale, section: (typeof navSections)[number]): string {
  return localePath(locale, section.page);
}
