import type { MetadataRoute } from 'next';
import { posts, projects } from '@/features/home/data/content';
import { routes } from '@/lib/i18n/paths';
import { routing } from '@/lib/i18n/routing';
import { absoluteUrl, alternateLanguages } from '@/lib/seo/metadata';

const PATHS: ReadonlyArray<{ pathname: string; priority: number }> = [
  { pathname: '/', priority: 1 },
  { pathname: routes.services, priority: 0.9 },
  { pathname: routes.work, priority: 0.8 },
  { pathname: routes.about, priority: 0.7 },
  { pathname: routes.contact, priority: 0.8 },
  { pathname: routes.privacy, priority: 0.3 },
  ...projects.map((project) => ({ pathname: routes.project(project.key), priority: 0.7 })),
  { pathname: routes.blog, priority: 0.7 },
  ...posts.map((post) => ({ pathname: routes.post(post.key), priority: 0.6 })),
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.flatMap(({ pathname, priority }) =>
    routing.locales.map((locale) => ({
      url: absoluteUrl(locale, pathname),
      changeFrequency: 'monthly' as const,
      priority,
      alternates: { languages: alternateLanguages(pathname) },
    })),
  );
}
