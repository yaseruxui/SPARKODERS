import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { CustomCursor } from '@/components/common/custom-cursor';
import { JsReady } from '@/components/common/js-ready';
import { PageLoader } from '@/components/common/page-loader';
import { SiteFooter } from '@/components/common/site-footer';
import { SiteHeader } from '@/components/common/site-header';
import { WhatsAppButton } from '@/components/common/whatsapp-button';
import { JsonLdScript } from '@/components/seo/json-ld';
import { site } from '@/lib/config/site';
import { brandFont, siteUrl } from '@/lib/env';
import { fontVariables } from '@/lib/fonts';
import { localeDirection, routing } from '@/lib/i18n/routing';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/json-ld';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { cn } from '@/utils/cn';
import '@/styles/globals.css';

/** Namespaces read by client components (forms, error boundary). Everything else stays on the server. */
const CLIENT_NAMESPACES = ['common', 'contact'] as const;

/** The two Thmanyah weights above the fold (body text and display headings). */
const BRAND_FONT_PRELOADS = [
  '/fonts/thmanyah/thmanyah-sans-Regular.woff2',
  '/fonts/thmanyah/thmanyah-sans-Black.woff2',
];

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: site.themeColor,
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    metadataBase: new URL(siteUrl),
    applicationName: site.wordmark,
    title: { default: t('defaultTitle'), template: `%s | ${t('siteName')}` },
    formatDetection: { telephone: false, email: false, address: false },
    ...buildPageMetadata({
      locale,
      pathname: '/',
      title: t('defaultTitle'),
      description: t('description'),
      siteName: t('siteName'),
      absoluteTitle: true,
    }),
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [t, tMeta, messages] = await Promise.all([
    getTranslations('common'),
    getTranslations('metadata'),
    getMessages(),
  ]);
  const clientMessages = Object.fromEntries(CLIENT_NAMESPACES.map((ns) => [ns, messages[ns]]));

  return (
    <html
      lang={locale}
      dir={localeDirection[locale]}
      className={cn(fontVariables)}
      data-brand-font={brandFont}
      suppressHydrationWarning
    >
      <head>
        {brandFont === 'thmanyah'
          ? BRAND_FONT_PRELOADS.map((href) => (
              <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="" />
            ))
          : null}
        {/* Flags that JS runs before first paint, so entrance styles never hide content without it. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a
          href="#main"
          className="fixed start-4 -top-15 z-[100] rounded-[10px] bg-aqua px-4 py-2.5 font-semibold text-ink transition-[top] duration-200 focus:top-3"
        >
          {t('skipToContent')}
        </a>
        <NextIntlClientProvider messages={clientMessages}>
          <JsReady />
          <PageLoader label={site.wordmark} />
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
          <WhatsAppButton />
          <CustomCursor />
        </NextIntlClientProvider>
        <JsonLdScript
          data={[
            organizationJsonLd(locale, { brand: t('brand'), description: tMeta('description') }),
            websiteJsonLd(locale, tMeta('siteName')),
          ]}
        />
      </body>
    </html>
  );
}
