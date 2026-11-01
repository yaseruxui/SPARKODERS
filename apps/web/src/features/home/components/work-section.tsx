import { getLocale, getTranslations } from 'next-intl/server';
import { ButtonLink } from '@/components/ui/button';
import { ArrowIcon } from '@/components/ui/icons';
import { projects } from '../data/content';
import { WorkCards } from './work-cards';
import { Kashida } from '@/components/ui/kashida';
import { localePath, routes } from '@/lib/i18n/paths';
import { resolveLocale } from '@/lib/i18n/resolve-locale';

export async function WorkSection() {
  const [t, rawLocale] = await Promise.all([getTranslations('home.work'), getLocale()]);
  const locale = resolveLocale(rawLocale);
  const rows = projects.map((project) => ({
    ...project,
    href: localePath(locale, routes.project(project.key)),
    title: t(`items.${project.key}.title`),
    category: t(`items.${project.key}.category`),
    alt: t(`items.${project.key}.alt`),
  }));

  return (
    <section id="work" className="relative border-t border-line bg-ink-2 py-[clamp(80px,12vw,160px)]">
      <div className="container-site">
        <div className="mb-[clamp(32px,5vw,56px)] flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="display-xl">
              <Kashida text={t('title')} />
            </h2>
            <p className="mt-4 text-lg text-muted">{t('lead')}</p>
          </div>
          {/* The end side of the row: the left edge in Arabic, the right in English. */}
          <ButtonLink href={localePath(locale, routes.work)} variant="ghost">
            {t('all')}
            <ArrowIcon />
          </ButtonLink>
        </div>
        <WorkCards rows={rows} detailsLabel={t('details')} />
      </div>
    </section>
  );
}
