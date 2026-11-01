import { Injectable, Logger } from '@nestjs/common';
import type { ContentDefaults } from '@sparkoders/contracts';
import { env } from '../config/env';

/** Talks to the public site: refreshes its cached content and reads its bundled defaults. */
@Injectable()
export class SiteClient {
  private readonly logger = new Logger(SiteClient.name);

  get configured(): boolean {
    return env().SITE_REVALIDATE_SECRET.length > 0;
  }

  /** Asks the site to drop its cached CMS content so the next visit shows the change. Never throws. */
  async revalidate(): Promise<boolean> {
    if (!this.configured) return false;
    try {
      const response = await fetch(`${env().SITE_URL}/api/revalidate`, {
        method: 'POST',
        headers: { 'x-revalidate-secret': env().SITE_REVALIDATE_SECRET },
        signal: AbortSignal.timeout(8_000),
      });
      if (!response.ok) this.logger.warn(`Site revalidation answered ${response.status}`);
      return response.ok;
    } catch (error) {
      this.logger.warn(`Site revalidation failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /** The content the site bundles today (used to fill an empty dashboard once). */
  async defaults(): Promise<ContentDefaults> {
    const response = await fetch(`${env().SITE_URL}/api/content-defaults`, {
      headers: { 'x-revalidate-secret': env().SITE_REVALIDATE_SECRET },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`The site answered ${response.status}`);
    return (await response.json()) as ContentDefaults;
  }
}
