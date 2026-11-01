import type { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/common/page-hero';
import { site } from '@/lib/config/site';
import { routes } from '@/lib/i18n/paths';
import { resolveLocale } from '@/lib/i18n/resolve-locale';
import { buildPageMetadata } from '@/lib/seo/metadata';

/** Date the policy text last changed; shown at the top of the page. */
const UPDATED = '2026-11-01';

export async function generateMetadata({ params }: PageProps<'/[locale]/privacy'>): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const [t, tMeta] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.privacy' }),
    getTranslations({ locale, namespace: 'metadata' }),
  ]);
  return buildPageMetadata({
    locale,
    pathname: routes.privacy,
    title: t('title'),
    description: t('metaDescription'),
    siteName: tMeta('siteName'),
  });
}

export default async function PrivacyPage({ params }: PageProps<'/[locale]/privacy'>) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const [t, format] = await Promise.all([getTranslations('pages.privacy'), getFormatter()]);
  const sections = t.raw('sections') as { title: string; body: string[] }[];

  return (
    <>
      <PageHero title={t('title')} lead={t('lead')}>
        <p className="mt-4 text-sm text-faint">
          {t('updated', {
            date: format.dateTime(new Date(UPDATED), { day: 'numeric', month: 'long', year: 'numeric' }),
          })}
        </p>
      </PageHero>
      <div className="container-site max-w-3xl pb-[clamp(80px,12vw,160px)] text-lg leading-[1.9] text-text/90">
        {sections.map((section) => (
          <section key={section.title} className="border-t border-line py-8 first:border-t-0 first:pt-0">
            <h2 className="mb-3 font-display text-[clamp(1.4rem,2.4vw,1.8rem)] font-extrabold text-text">
              {section.title}
            </h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="my-3">
                {paragraph.replace('{email}', site.email)}
              </p>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}
