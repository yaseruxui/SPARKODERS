import 'server-only';
import type { PublicContent } from '@sparkoders/contracts';
import { cache } from 'react';
import { getServerEnv } from '@/lib/env';
import { timingSafeEqual } from 'node:crypto';

/** Cache tag on the dashboard content; /api/revalidate drops it after every save in the dashboard. */
export const CMS_TAG = 'cms';

/**
 * Content edited in the dashboard, or null when no API is configured or it cannot be reached.
 * Callers then use the site's bundled copy, so the site never breaks because of the dashboard.
 */
export const getCms = cache(async (): Promise<PublicContent | null> => {
  const { CMS_API_URL } = getServerEnv();
  if (!CMS_API_URL) return null;
  try {
    const response = await fetch(`${CMS_API_URL.replace(/\/$/, '')}/public/content`, {
      cache: 'force-cache',
      next: { tags: [CMS_TAG] },
      signal: AbortSignal.timeout(5_000),
    });
    return response.ok ? ((await response.json()) as PublicContent) : null;
  } catch {
    return null;
  }
});

/** True when the request carries the shared revalidation secret. */
export function hasRevalidateSecret(header: string | null): boolean {
  const { REVALIDATE_SECRET } = getServerEnv();
  if (!REVALIDATE_SECRET || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(REVALIDATE_SECRET);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Writes "a.b.c" = value into a nested messages object (used to apply edited texts). */
export function setPath(target: Record<string, unknown>, path: string, value: string): void {
  const parts = path.split('.');
  let node: Record<string, unknown> = target;
  for (const part of parts.slice(0, -1)) {
    const next = node[part];
    if (typeof next !== 'object' || next === null) return; // unknown key: ignore rather than invent structure
    node = next as Record<string, unknown>;
  }
  const last = parts.at(-1);
  if (last && typeof node[last] === 'string') node[last] = value;
}

/** Every string in a messages object as "a.b.c" → text. */
export function flatten(source: unknown, prefix = '', out: Record<string, string> = {}): Record<string, string> {
  if (typeof source === 'string') out[prefix] = source;
  else if (source && typeof source === 'object' && !Array.isArray(source)) {
    for (const [key, value] of Object.entries(source)) flatten(value, prefix ? `${prefix}.${key}` : key, out);
  }
  return out;
}
