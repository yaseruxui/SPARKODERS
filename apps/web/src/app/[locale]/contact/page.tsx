import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactSection } from '@/features/contact/components/contact-section';
import { routes } from '@/lib/i18n/paths';
import { resolveLocale } from '@/lib/i18n/resolve-locale';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: PageProps<'/[locale]/contact'>): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const [t, tMeta] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.contact' }),
    getTranslations({ locale, namespace: 'metadata' }),
  ]);
  return buildPageMetadata({
    locale,
    pathname: routes.contact,
    title: t('metaTitle'),
    description: t('metaDescription'),
    siteName: tMeta('siteName'),
  });
}

export default async function ContactPage({ params }: PageProps<'/[locale]/contact'>) {
  setRequestLocale(resolveLocale((await params).locale));
  return <ContactSection asPage />;
}
