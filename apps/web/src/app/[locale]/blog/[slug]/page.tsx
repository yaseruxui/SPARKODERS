import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CtaBand } from '@/components/common/cta-band';
import { PostCard } from '@/features/blog/components/post-card';
import { getPostCards, isPostKey } from '@/features/blog/lib/posts';
import { ArrowIcon } from '@/components/ui/icons';
import { ProjectArt } from '@/features/home/components/project-art';
import { posts } from '@/features/home/data/content';
import { localePath, routes } from '@/lib/i18n/paths';
import { resolveLocale } from '@/lib/i18n/resolve-locale';
import { routing } from '@/lib/i18n/routing';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const dynamicParams = false;

type Block = { type: 'p' | 'h2'; text: string } | { type: 'ul'; items: string[] };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => posts.map((post) => ({ locale, slug: post.key })));
}

export async function generateMetadata({ params }: PageProps<'/[locale]/blog/[slug]'>): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  if (!isPostKey(slug)) return {};
  const [tBlog, tArticles, tMeta] = await Promise.all([
    getTranslations({ locale, namespace: 'home.blog' }),
    getTranslations({ locale, namespace: 'articles' }),
    getTranslations({ locale, namespace: 'metadata' }),
  ]);
  return buildPageMetadata({
    locale,
    pathname: routes.post(slug),
    title: tBlog(`items.${slug}.title`),
    description: tArticles(`${slug}.excerpt`),
    siteName: tMeta('siteName'),
  });
}

export default async function PostPage({ params }: PageProps<'/[locale]/blog/[slug]'>) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  if (!isPostKey(slug)) notFound();
  setRequestLocale(locale);

  const [t, tWork, tArticles, cards] = await Promise.all([
    getTranslations('pages.blog'),
    getTranslations('pages.work'),
    getTranslations('articles'),
    getPostCards(locale, { withExcerpt: true }),
  ]);
  const post = cards.find((card) => card.key === slug);
  if (!post) notFound();
  const body = tArticles.raw(`${slug}.body`) as Block[];
  const related = cards.filter((card) => card.key !== slug);

  return (
    <>
      <article className="pt-[calc(var(--header-h)+clamp(40px,7vw,96px))]">
        <header className="container-site max-w-4xl">
          <a
            href={localePath(locale, routes.blog)}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-aqua"
          >
            <ArrowIcon className="rotate-180" />
            {t('back')}
          </a>
          <p className="text-sm text-faint">
            {post.category} · <time dateTime={post.date}>{post.dateLabel}</time> ·{' '}
            {t('readTime', { time: tArticles(`${slug}.readTime`) })}
          </p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4.6vw,3.5rem)] leading-[1.3] font-extrabold">
            {post.title}
          </h1>
          <p className="mt-5 text-lg text-muted sm:text-xl">{post.excerpt}</p>
        </header>

        <div className="container-site mt-10 max-w-5xl">
          <ProjectArt
            accent={post.accent}
            image={post.image}
            alt={post.alt}
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="aspect-[16/9] w-full rounded-[28px]"
          />
        </div>

        <div className="container-site mt-12 max-w-3xl text-lg leading-[1.95] text-text/90">
          {body.map((block, index) => {
            if (block.type === 'h2')
              return (
                <h2
                  key={index}
                  className="mt-12 mb-4 font-display text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.4] font-extrabold text-text"
                >
                  {block.text}
                </h2>
              );
            if (block.type === 'ul')
              return (
                <ul key={index} className="my-5 grid gap-2.5">
                  {block.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span aria-hidden="true" className="mt-[0.8em] size-2 shrink-0 rounded-full bg-aqua" />
                      {item}
                    </li>
                  ))}
                </ul>
              );
            return (
              <p key={index} className="my-5">
                {block.text}
              </p>
            );
          })}
        </div>
      </article>

      <section className="mt-[clamp(56px,8vw,112px)] border-t border-line pt-[clamp(48px,7vw,96px)]">
        <div className="container-site">
          <h2 className="display-xl mb-10">{t('related')}</h2>
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2">
            {related.map((card, index) => (
              <PostCard key={card.key} post={card} index={index} />
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title={t('ctaTitle')}
        body={tWork('ctaBody')}
        label={tWork('cta')}
        href={localePath(locale, routes.contact)}
      />
    </>
  );
}
