import { getLocale, getTranslations } from 'next-intl/server';
import { ButtonLink } from '@/components/ui/button';
import { ArrowIcon } from '@/components/ui/icons';
import { Kashida } from '@/components/ui/kashida';
import { PostCard } from '@/features/blog/components/post-card';
import { getPostCards } from '@/features/blog/lib/posts';
import { localePath, routes } from '@/lib/i18n/paths';
import { resolveLocale } from '@/lib/i18n/resolve-locale';

export async function BlogSection() {
  const locale = resolveLocale(await getLocale());
  const [t, cards] = await Promise.all([getTranslations('home.blog'), getPostCards(locale)]);

  return (
    <section id="blog" className="border-t border-line bg-ink-2 py-[clamp(80px,12vw,160px)]">
      <div className="container-site">
        <div className="mb-[clamp(32px,5vw,56px)] flex flex-wrap items-end justify-between gap-6">
          <h2 className="display-xl">
            <Kashida text={t('title')} />
          </h2>
          <ButtonLink href={localePath(locale, routes.blog)} variant="ghost">
            {t('all')}
            <ArrowIcon />
          </ButtonLink>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((post, index) => (
            <PostCard key={post.key} post={post} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
