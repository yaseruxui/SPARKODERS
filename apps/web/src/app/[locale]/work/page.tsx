import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CtaBand } from '@/components/common/cta-band';
import { PageHero } from '@/components/common/page-hero';
import { WorkCards } from '@/features/home/components/work-cards';
import { getProjectRows } from '@/features/work/lib/projects';
import { localePath, routes } from '@/lib/i18n/paths';
import { resolveLocale } from '@/lib/i18n/resolve-locale';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: PageProps<'/[locale]/work'>): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const [t, tMeta] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.work' }),
    getTranslations({ locale, namespace: 'metadata' }),
  ]);
  return buildPageMetadata({
    locale,
    pathname: routes.work,
    title: t('metaTitle'),
    description: t('metaDescription'),
    siteName: tMeta('siteName'),
  });
}

export default async function WorkPage({ params }: PageProps<'/[locale]/work'>) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const [t, tHome, rows] = await Promise.all([
    getTranslations('pages.work'),
    getTranslations('home.work'),
    getProjectRows(locale),
  ]);

  return (
    <>
      <PageHero title={t('title')} lead={t('lead')} />
      <section className="pb-[clamp(24px,4vw,48px)]">
        <div className="container-site">
          <WorkCards rows={rows} detailsLabel={tHome('details')} />
        </div>
      </section>
      <CtaBand title={t('ctaTitle')} body={t('ctaBody')} label={t('cta')} href={localePath(locale, routes.contact)} />
    </>
  );
}
