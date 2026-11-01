import type { ProjectRow } from '@/features/home/types';
import { getProjects } from '@/lib/content';
import { localePath, routes } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/routing';

/** Every project as card data for the given locale (dashboard content, else the bundled copy). */
export async function getProjectRows(locale: Locale): Promise<ProjectRow[]> {
  return (await getProjects(locale)).map((p) => ({
    key: p.slug,
    accent: p.accent,
    image: p.image,
    href: localePath(locale, routes.project(p.slug)),
    title: p.title,
    category: p.category,
    alt: p.alt,
  }));
}
