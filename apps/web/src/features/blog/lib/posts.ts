import { getFormatter } from 'next-intl/server';
import { getPosts } from '@/lib/content';
import { localePath, routes } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/routing';
import type { PostCardData } from '../components/post-card';

/** Every post as card data for the given locale, newest first. */
export async function getPostCards(locale: Locale, { withExcerpt = false } = {}): Promise<PostCardData[]> {
  const [items, format] = await Promise.all([getPosts(locale), getFormatter({ locale })]);
  return [...items]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((post) => ({
      key: post.slug,
      href: localePath(locale, routes.post(post.slug)),
      accent: post.accent,
      image: post.image,
      alt: post.alt,
      title: post.title,
      category: post.category,
      date: post.date,
      dateLabel: format.dateTime(new Date(post.date), { day: 'numeric', month: 'long', year: 'numeric' }),
      excerpt: withExcerpt ? post.excerpt : undefined,
    }));
}
