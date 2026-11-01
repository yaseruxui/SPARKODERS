import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CtaBand } from '@/components/common/cta-band';
import { PageHero } from '@/components/common/page-hero';
import { ButtonLink } from '@/components/ui/button';
import { ArrowIcon } from '@/components/ui/icons';
import { DelightSection } from '@/features/home/components/delight-section';
import { ServiceIcon } from '@/features/home/components/service-icon';
import { services } from '@/features/home/data/content';
import { localePath, routes } from '@/lib/i18n/paths';
import { resolveLocale } from '@/lib/i18n/resolve-locale';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { cn } from '@/utils/cn';

export async function generateMetadata({ params }: PageProps<'/[locale]/services'>): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const [t, tMeta] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.services' }),
    getTranslations({ locale, namespace: 'metadata' }),
  ]);
  return buildPageMetadata({
    locale,
    pathname: routes.services,
    title: t('metaTitle'),
    description: t('metaDescription'),
    siteName: tMeta('siteName'),
  });
}

/** Every service in full: what it is, who it suits and what you receive, with its picture. */
export default async function ServicesPage({ params }: PageProps<'/[locale]/services'>) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const [t, tHome, tBlog, tWork] = await Promise.all([
    getTranslations('pages.services'),
    getTranslations('home.services'),
    getTranslations('pages.blog'),
    getTranslations('pages.work'),
  ]);
  const contact = localePath(locale, routes.contact);

  return (
    <>
      <PageHero title={t('title')} lead={t('lead')} />
      <div className="pb-[clamp(32px,5vw,64px)]">
        {services.map((key, index) => {
          const deliverables = t.raw(`items.${key}.deliverables`) as string[];
          return (
            <section
              key={key}
              id={key}
              aria-labelledby={`service-${key}`}
              className="border-t border-line py-[clamp(48px,7vw,96px)]"
            >
              <div className="container-site grid items-center gap-[clamp(32px,5vw,80px)] lg:grid-cols-2">
                <div className={cn(index % 2 && 'lg:order-2')}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] shadow-[0_40px_80px_-40px_rgb(0_0_0/0.9)] outline outline-1 -outline-offset-1 outline-white/10">
                    <Image
                      src={`/images/services/${key}.webp`}
                      alt={tHome(`items.${key}.alt`)}
                      fill
                      sizes="(max-width: 1024px) 100vw, 600px"
                      className="object-cover"
                    />
                  </div>
                </div>
                <div>
                  <span className="service-icon mb-5 grid size-16 place-items-center text-white">
                    <ServiceIcon service={key} />
                  </span>
                  <h2
                    id={`service-${key}`}
                    className="font-display text-[clamp(1.8rem,3.4vw,2.75rem)] leading-[1.3] font-extrabold"
                  >
                    {tHome(`items.${key}.title`)}
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-muted">{t(`items.${key}.intro`)}</p>
                  <p className="mt-5 text-[0.9375rem]">
                    <span className="font-semibold text-aqua">{t('forWho')}: </span>
                    <span className="text-text/85">{t(`items.${key}.forWho`)}</span>
                  </p>
                  <p className="label-sm mt-6">{t('deliverables')}</p>
                  <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    {deliverables.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-[0.9375rem] text-text/90">
                        <span className="mt-1 grid size-[18px] shrink-0 place-items-center rounded-full bg-aqua/15 text-aqua">
                          <svg
                            viewBox="0 0 12 12"
                            className="size-2.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M2.5 6.2 5 8.5l4.5-5" />
                          </svg>
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <ButtonLink href={contact} variant="ghost" className="mt-8">
                    {t('cta')}
                    <ArrowIcon />
                  </ButtonLink>
                </div>
              </div>
            </section>
          );
        })}
      </div>
      <DelightSection />
      <CtaBand title={tBlog('ctaTitle')} body={tWork('ctaBody')} label={tWork('cta')} href={contact} />
    </>
  );
}
