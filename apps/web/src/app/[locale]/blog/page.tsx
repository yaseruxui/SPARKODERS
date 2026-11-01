import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CtaBand } from '@/components/common/cta-band';
import { PageHero } from '@/components/common/page-hero';
import { PostCard } from '@/features/blog/components/post-card';
import { getPostCards } from '@/features/blog/lib/posts';
import { localePath, routes } from '@/lib/i18n/paths';
import { resolveLocale } from '@/lib/i18n/resolve-locale';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: PageProps<'/[locale]/blog'>): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const [t, tMeta] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.blog' }),
    getTranslations({ locale, namespace: 'metadata' }),
  ]);
  return buildPageMetadata({
    locale,
    pathname: routes.blog,
    title: t('metaTitle'),
    description: t('metaDescription'),
    siteName: tMeta('siteName'),
  });
}

export default async function BlogPage({ params }: PageProps<'/[locale]/blog'>) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const [t, tWork, cards] = await Promise.all([
    getTranslations('pages.blog'),
    getTranslations('pages.work'),
    getPostCards(locale, { withExcerpt: true }),
  ]);

  return (
    <>
      <PageHero title={t('title')} lead={t('lead')} />
      <section className="pb-[clamp(24px,4vw,48px)]">
        <div className="container-site grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((post, index) => (
            <PostCard key={post.key} post={post} index={index} />
          ))}
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
