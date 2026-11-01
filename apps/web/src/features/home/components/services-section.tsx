import { getLocale, getTranslations } from 'next-intl/server';
import { ButtonLink } from '@/components/ui/button';
import { ArrowIcon } from '@/components/ui/icons';
import { localePath, routes } from '@/lib/i18n/paths';
import { resolveLocale } from '@/lib/i18n/resolve-locale';
import { Kashida } from '@/components/ui/kashida';
import { services } from '../data/content';
import { ServicesList } from './services-list';

/**
 * What we do: one row per service on the brand gradient; hovering a row shows its picture
 * beside the pointer. Each row leads to the contact form.
 */
export async function ServicesSection() {
  const [t, rawLocale] = await Promise.all([getTranslations('home.services'), getLocale()]);
  const locale = resolveLocale(rawLocale);

  return (
    <section
      id="services"
      aria-label={t('aria')}
      className="relative overflow-hidden bg-[radial-gradient(60%_80%_at_100%_0%,rgb(178_108_255/0.35),transparent_60%),radial-gradient(60%_80%_at_0%_100%,rgb(127_238_250/0.2),transparent_60%),var(--grad-soft)] py-[clamp(80px,12vw,160px)]"
    >
      <div className="container-site">
        <div className="mb-[clamp(32px,5vw,56px)] flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="display-xl">
              <Kashida text={t('title')} />
            </h2>
            <p className="mt-4 text-lg text-text/85">{t('lead')}</p>
          </div>
          <ButtonLink href={localePath(locale, routes.services)} variant="ghost">
            {t('all')}
            <ArrowIcon />
          </ButtonLink>
        </div>
        <ServicesList
          ctaLabel={t('cta')}
          rows={services.map((key) => ({
            key,
            title: t(`items.${key}.title`),
            body: t(`items.${key}.body`),
            alt: t(`items.${key}.alt`),
            image: `/images/services/${key}.webp`,
          }))}
        />
      </div>
    </section>
  );
}
