import { getFormatter, getTranslations } from 'next-intl/server';
import { posts } from '@/features/home/data/content';
import type { PostKey } from '@/features/home/types';
import { localePath, routes } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/routing';
import type { PostCardData } from '../components/post-card';

/** Every post as card data for the given locale, newest first. */
export async function getPostCards(locale: Locale, { withExcerpt = false } = {}): Promise<PostCardData[]> {
  const [t, tArticles, format] = await Promise.all([
    getTranslations({ locale, namespace: 'home.blog' }),
    getTranslations({ locale, namespace: 'articles' }),
    getFormatter({ locale }),
  ]);
  return posts.map((post) => ({
    key: post.key,
    href: localePath(locale, routes.post(post.key)),
    accent: post.accent,
    image: post.image,
    alt: t(`items.${post.key}.alt`),
    title: t(`items.${post.key}.title`),
    category: t('category'),
    date: post.date,
    dateLabel: format.dateTime(new Date(post.date), { day: 'numeric', month: 'long', year: 'numeric' }),
    excerpt: withExcerpt ? tArticles(`${post.key}.excerpt`) : undefined,
  }));
}

export function isPostKey(value: string): value is PostKey {
  return posts.some((post) => post.key === value);
}
