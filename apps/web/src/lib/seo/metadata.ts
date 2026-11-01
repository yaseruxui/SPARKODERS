import type { Metadata } from 'next';
import { site } from '@/lib/config/site';
import { siteUrl } from '@/lib/env';
import { getPathname } from '@/lib/i18n/navigation';
import { ogLocale, routing, type Locale } from '@/lib/i18n/routing';

export function absoluteUrl(locale: Locale, pathname: string): string {
  return `${siteUrl}${getPathname({ href: pathname, locale })}`;
}

export function alternateLanguages(pathname: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) languages[locale] = absoluteUrl(locale, pathname);
  languages['x-default'] = absoluteUrl(routing.defaultLocale, pathname);
  return languages;
}

interface PageMetadataInput {
  locale: Locale;
  pathname: string;
  title: string;
  description: string;
  siteName: string;
  absoluteTitle?: boolean;
}

export function buildPageMetadata({
  locale,
  pathname,
  title,
  description,
  siteName,
  absoluteTitle = false,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(locale, pathname);
  const ogImage = `${absoluteUrl(locale, '/')}/opengraph-image`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url, languages: alternateLanguages(pathname) },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName,
      locale: ogLocale[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
      images: [{ url: ogImage, width: 1200, height: 630, alt: siteName }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    icons: { icon: site.logo },
  };
}
