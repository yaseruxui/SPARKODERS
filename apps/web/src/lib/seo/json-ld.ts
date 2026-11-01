import { site } from '@/lib/config/site';
import { siteUrl } from '@/lib/env';
import type { Locale } from '@/lib/i18n/routing';
import type { JsonLd } from '@/types/seo';
import { absoluteUrl } from './metadata';

export function organizationJsonLd(locale: Locale, names: { brand: string; description: string }): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: names.brand,
    alternateName: site.wordmark,
    description: names.description,
    url: absoluteUrl(locale, '/'),
    logo: `${siteUrl}${site.logo}`,
    email: site.email,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: site.email,
        contactType: 'sales',
        availableLanguage: ['ar', 'en'],
      },
    ],
  };
}

export function websiteJsonLd(locale: Locale, name: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name,
    url: absoluteUrl(locale, '/'),
    inLanguage: locale,
    publisher: { '@id': `${siteUrl}/#organization` },
  };
}
