import { getTranslations } from 'next-intl/server';
import { projects } from '@/features/home/data/content';
import type { ProjectKey, ProjectRow } from '@/features/home/types';
import { localePath, routes } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/routing';

/** Every project as card data for the given locale. */
export async function getProjectRows(locale: Locale): Promise<ProjectRow[]> {
  const t = await getTranslations({ locale, namespace: 'home.work' });
  return projects.map((project) => ({
    ...project,
    href: localePath(locale, routes.project(project.key)),
    title: t(`items.${project.key}.title`),
    category: t(`items.${project.key}.category`),
    alt: t(`items.${project.key}.alt`),
  }));
}

export function isProjectKey(value: string): value is ProjectKey {
  return projects.some((project) => project.key === value);
}

/** One result figure of a case study. */
export interface ProjectResult {
  value: string;
  label: string;
}
