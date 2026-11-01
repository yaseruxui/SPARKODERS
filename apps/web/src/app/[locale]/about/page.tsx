import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CtaBand } from '@/components/common/cta-band';
import { PageHero } from '@/components/common/page-hero';
import { Reveal } from '@/components/ui/reveal';
import { DelightSection } from '@/features/home/components/delight-section';
import { TeamSection } from '@/features/home/components/team-section';
import { TestimonialsSection } from '@/features/home/components/testimonials-section';
import { localePath, routes } from '@/lib/i18n/paths';
import { resolveLocale } from '@/lib/i18n/resolve-locale';
import { buildPageMetadata } from '@/lib/seo/metadata';

/** Duotone icons for the three values (clarity, quality, partnership), styled by `.service-icon`. */
const VALUE_ICONS: readonly ReactNode[] = [
  <>
    <path className="duo" d="M4 24s7-12 20-12 20 12 20 12-7 12-20 12S4 24 4 24Z" />
    <path d="M4 24s7-12 20-12 20 12 20 12-7 12-20 12S4 24 4 24Z" />
    <circle className="accent" cx="24" cy="24" r="6" />
  </>,
  <>
    <path className="duo" d="M24 4 40 10v12c0 10-7 18-16 22-9-4-16-12-16-22V10Z" />
    <path d="M24 4 40 10v12c0 10-7 18-16 22-9-4-16-12-16-22V10Z" />
    <path className="accent" d="m17 24 5 5 9-10" />
  </>,
  <>
    <circle className="duo" cx="16" cy="16" r="7" />
    <circle className="duo" cx="32" cy="16" r="7" />
    <circle cx="16" cy="16" r="7" />
    <circle className="accent" cx="32" cy="16" r="7" />
    <path d="M4 42c0-7 5-12 12-12 3.5 0 6.4 1.3 8.5 3.4" />
    <path className="accent" d="M44 42c0-7-5-12-12-12-4 0-7.3 1.6-9.4 4.2" />
  </>,
];

export async function generateMetadata({ params }: PageProps<'/[locale]/about'>): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const [t, tMeta] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.about' }),
    getTranslations({ locale, namespace: 'metadata' }),
  ]);
  return buildPageMetadata({
    locale,
    pathname: routes.about,
    title: t('metaTitle'),
    description: t('metaDescription'),
    siteName: tMeta('siteName'),
  });
}

export default async function AboutPage({ params }: PageProps<'/[locale]/about'>) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const [t, tBlog, tWork] = await Promise.all([
    getTranslations('pages.about'),
    getTranslations('pages.blog'),
    getTranslations('pages.work'),
  ]);
  const values = t.raw('values') as { title: string; body: string }[];

  return (
    <>
      <PageHero title={t('title')} lead={t('lead')}>
        <ul className="mt-10 grid gap-4 sm:grid-cols-3">
          {values.map((value, index) => (
            <Reveal
              as="li"
              key={value.title}
              index={index}
              className="rounded-panel bg-white/[0.03] p-6 shadow-[inset_0_0_0_1px_var(--color-line-strong)]"
            >
              <span className="service-icon mb-4 grid size-12 place-items-center text-white">
                <svg
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                  className="size-full overflow-visible"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {VALUE_ICONS[index]}
                </svg>
              </span>
              <b className="font-display text-xl text-violet">{value.title}</b>
              <p className="mt-2 text-muted">{value.body}</p>
            </Reveal>
          ))}
        </ul>
      </PageHero>
      <TeamSection />
      <DelightSection />
      <TestimonialsSection />
      <CtaBand
        title={tBlog('ctaTitle')}
        body={tWork('ctaBody')}
        label={tWork('cta')}
        href={localePath(locale, routes.contact)}
      />
    </>
  );
}
