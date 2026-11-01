import type { MetadataRoute } from 'next';
import { getPosts, getProjects } from '@/lib/content';
import { routes } from '@/lib/i18n/paths';
import { routing } from '@/lib/i18n/routing';
import { absoluteUrl, alternateLanguages } from '@/lib/seo/metadata';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getProjects('ar'), getPosts('ar')]);
  const PATHS: ReadonlyArray<{ pathname: string; priority: number }> = [
  { pathname: '/', priority: 1 },
  { pathname: routes.services, priority: 0.9 },
  { pathname: routes.work, priority: 0.8 },
  { pathname: routes.about, priority: 0.7 },
  { pathname: routes.contact, priority: 0.8 },
  { pathname: routes.privacy, priority: 0.3 },
  ...projects.map((project) => ({ pathname: routes.project(project.slug), priority: 0.7 })),
  { pathname: routes.blog, priority: 0.7 },
  ...posts.map((post) => ({ pathname: routes.post(post.slug), priority: 0.6 })),
];

  return PATHS.flatMap(({ pathname, priority }) =>
    routing.locales.map((locale) => ({
      url: absoluteUrl(locale, pathname),
      changeFrequency: 'monthly' as const,
      priority,
      alternates: { languages: alternateLanguages(pathname) },
    })),
  );
}
