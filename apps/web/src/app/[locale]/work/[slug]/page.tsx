import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CtaBand } from '@/components/common/cta-band';
import { PageHero } from '@/components/common/page-hero';
import { ArrowIcon } from '@/components/ui/icons';
import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/ui/reveal';
import { ProjectArt } from '@/features/home/components/project-art';
import { getProjectRows } from '@/features/work/lib/projects';
import { getProjects } from '@/lib/content';
import { localePath, routes } from '@/lib/i18n/paths';
import { resolveLocale } from '@/lib/i18n/resolve-locale';
import { routing } from '@/lib/i18n/routing';
import { buildPageMetadata } from '@/lib/seo/metadata';

/** Projects added in the dashboard after a build render on first visit. */
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = (await getProjects('ar')).map((p) => p.slug);
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps<'/[locale]/work/[slug]'>): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const [project, tMeta] = await Promise.all([
    getProjects(locale).then((all) => all.find((p) => p.slug === slug)),
    getTranslations({ locale, namespace: 'metadata' }),
  ]);
  if (!project) return {};
  return buildPageMetadata({
    locale,
    pathname: routes.project(slug),
    title: project.title,
    description: project.summary,
    siteName: tMeta('siteName'),
  });
}

export default async function ProjectPage({ params }: PageProps<'/[locale]/work/[slug]'>) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  setRequestLocale(locale);

  const [t, all, rows] = await Promise.all([getTranslations('pages.work'), getProjects(locale), getProjectRows(locale)]);
  const index = all.findIndex((p) => p.slug === slug);
  const project = all[index];
  const next = rows[(index + 1) % rows.length];
  if (!project || !next) notFound();

  const { services, features, results } = project;
  const facts = [
    { label: t('client'), value: project.client },
    { label: t('sector'), value: project.category },
    { label: t('year'), value: project.year },
    { label: t('duration'), value: project.duration },
  ];

  return (
    <>
      <PageHero
        title={project.title}
        lead={project.summary}
        back={{ href: localePath(locale, routes.work), label: t('back') }}
      >
        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="label-sm">{fact.label}</dt>
              <dd className="mt-1 font-display text-lg font-semibold">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </PageHero>

      <section className="pb-[clamp(48px,7vw,96px)]">
        <div className="container-site">
          <ProjectArt
            accent={project.accent}
            image={project.image}
            alt={project.alt}
            sizes="(max-width: 1280px) 100vw, 1200px"
            className="aspect-[16/10] w-full rounded-[28px] sm:aspect-[16/9]"
          />
        </div>
      </section>

      <section className="pb-[clamp(48px,7vw,96px)]">
        <div className="container-site grid gap-[clamp(32px,5vw,72px)] lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="label-sm">{t('services')}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {services.map((service) => (
                <li key={service}>
                  <Pill>{service}</Pill>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-10">
            <div>
              <h2 className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] font-extrabold">{t('challenge')}</h2>
              <p className="mt-3 text-lg leading-relaxed text-muted">{project.challenge}</p>
            </div>
            <div>
              <h2 className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] font-extrabold">{t('solution')}</h2>
              <p className="mt-3 text-lg leading-relaxed text-muted">{project.solution}</p>
            </div>
            <div>
              <h2 className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] font-extrabold">{t('features')}</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 rounded-2xl bg-white/[0.03] px-4 py-3.5 shadow-[inset_0_0_0_1px_var(--color-line)]"
                  >
                    <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-aqua text-ink">
                      <svg
                        viewBox="0 0 12 12"
                        className="size-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M2.5 6.2 5 8.5l4.5-5" />
                      </svg>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-ink-2 py-[clamp(48px,7vw,96px)]">
        <div className="container-site">
          <h2 className="display-xl">{t('results')}</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {results.map((result, i) => (
              <Reveal
                as="li"
                key={result.label}
                index={i}
                className="rounded-panel bg-white/[0.03] p-6 shadow-[inset_0_0_0_1px_var(--color-line-strong)]"
              >
                <b
                  dir="ltr"
                  className="inline-block font-display text-[clamp(2rem,4vw,3rem)] leading-tight font-extrabold text-gradient-blue"
                >
                  {result.value}
                </b>
                <span className="mt-2 block text-muted">{result.label}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="pt-[clamp(48px,7vw,96px)]">
        <div className="container-site">
          <a
            href={next.href}
            className="group/next grid items-center gap-6 rounded-[28px] bg-white/[0.03] p-4 shadow-[inset_0_0_0_1px_var(--color-line)] transition-[box-shadow,background-color] duration-400 ease-brand hover:bg-white/[0.05] hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)] sm:grid-cols-[240px_1fr_auto] sm:p-5"
          >
            <ProjectArt
              accent={next.accent}
              image={next.image}
              alt=""
              sizes="240px"
              className="aspect-[4/3] rounded-[18px]"
            />
            <span>
              <span className="label-sm">{t('next')}</span>
              <span className="mt-1 block font-display text-[clamp(1.4rem,2.6vw,2rem)] font-extrabold transition-colors group-hover/next:text-aqua">
                {next.title}
              </span>
            </span>
            <ArrowIcon className="size-8 text-aqua transition-[translate] duration-400 ease-brand max-sm:hidden" />
          </a>
        </div>
      </section>

      <CtaBand title={t('ctaTitle')} body={t('ctaBody')} label={t('cta')} href={localePath(locale, routes.contact)} />
    </>
  );
}
