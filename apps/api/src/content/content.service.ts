import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  type CollectionItem,
  type CollectionKey,
  COLLECTIONS,
  type PublicContent,
  type SiteSettings,
  siteSettingsSchema,
  type TextOverrides,
} from '@sparkoders/contracts';
import type { CollectionItem as Row } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SiteClient } from '../site/site-client.service';

const SETTINGS_KEY = 'contact';

export function isCollection(value: string): value is CollectionKey {
  return (COLLECTIONS as readonly string[]).includes(value);
}

function toItem<K extends CollectionKey>(row: Row): CollectionItem<K> {
  return {
    id: row.id,
    published: row.published,
    position: row.position,
    data: row.data as unknown as CollectionItem<K>['data'],
    updatedAt: row.updatedAt.toISOString(),
  };
}

@Injectable()
export class ContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly site: SiteClient,
  ) {}

  async list<K extends CollectionKey>(collection: K): Promise<CollectionItem<K>[]> {
    const rows = await this.prisma.collectionItem.findMany({ where: { collection }, orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] });
    return rows.map((row) => toItem<K>(row));
  }

  /** Projects and posts are addressed by slug, so it must be unique within the collection. */
  private async assertUniqueSlug(collection: CollectionKey, data: unknown, exceptId?: string): Promise<void> {
    const slug = (data as { slug?: unknown }).slug;
    if (typeof slug !== 'string') return;
    const rows = await this.prisma.collectionItem.findMany({ where: { collection } });
    if (rows.some((row) => row.id !== exceptId && (row.data as { slug?: unknown }).slug === slug)) {
      throw new BadRequestException({ message: 'هذا الرابط (slug) مستخدم بالفعل.', fields: ['data.slug'] });
    }
  }

  async create<K extends CollectionKey>(collection: K, input: { published: boolean; data: unknown }): Promise<CollectionItem<K>> {
    await this.assertUniqueSlug(collection, input.data);
    const last = await this.prisma.collectionItem.findFirst({ where: { collection }, orderBy: { position: 'desc' } });
    const row = await this.prisma.collectionItem.create({
      data: { collection, published: input.published, data: input.data as object, position: (last?.position ?? -1) + 1 },
    });
    void this.site.revalidate();
    return toItem<K>(row);
  }

  async update<K extends CollectionKey>(collection: K, id: string, input: { published: boolean; data: unknown }): Promise<CollectionItem<K>> {
    await this.find(collection, id);
    await this.assertUniqueSlug(collection, input.data, id);
    const row = await this.prisma.collectionItem.update({ where: { id }, data: { published: input.published, data: input.data as object } });
    void this.site.revalidate();
    return toItem<K>(row);
  }

  async remove(collection: CollectionKey, id: string): Promise<void> {
    await this.find(collection, id);
    await this.prisma.collectionItem.delete({ where: { id } });
    void this.site.revalidate();
  }

  async reorder(collection: CollectionKey, ids: string[]): Promise<void> {
    await this.prisma.$transaction(
      ids.map((id, position) => this.prisma.collectionItem.updateMany({ where: { id, collection }, data: { position } })),
    );
    void this.site.revalidate();
  }

  async texts(): Promise<TextOverrides> {
    const rows = await this.prisma.textOverride.findMany();
    const texts: TextOverrides = { ar: {}, en: {} };
    for (const row of rows) if (row.locale === 'ar' || row.locale === 'en') texts[row.locale][row.key] = row.value;
    return texts;
  }

  async setText(locale: 'ar' | 'en', key: string, value: string | null): Promise<TextOverrides> {
    if (value === null) await this.prisma.textOverride.deleteMany({ where: { locale, key } });
    else await this.prisma.textOverride.upsert({ where: { locale_key: { locale, key } }, create: { locale, key, value }, update: { value } });
    void this.site.revalidate();
    return this.texts();
  }

  async settings(): Promise<SiteSettings | null> {
    const row = await this.prisma.setting.findUnique({ where: { key: SETTINGS_KEY } });
    const parsed = siteSettingsSchema.safeParse(row?.value);
    return parsed.success ? parsed.data : null;
  }

  async saveSettings(settings: SiteSettings): Promise<SiteSettings> {
    await this.prisma.setting.upsert({ where: { key: SETTINGS_KEY }, create: { key: SETTINGS_KEY, value: settings }, update: { value: settings } });
    void this.site.revalidate();
    return settings;
  }

  /** Everything the site reads, published items only. */
  async publicContent(): Promise<PublicContent> {
    const [settings, texts, rows] = await Promise.all([
      this.settings(),
      this.texts(),
      this.prisma.collectionItem.findMany({ where: { published: true }, orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] }),
    ]);
    const of = <K extends CollectionKey>(key: K) =>
      rows.filter((r) => r.collection === key).map((r) => r.data as unknown as CollectionItem<K>['data']);
    return {
      settings,
      texts,
      services: of('services'),
      team: of('team'),
      testimonials: of('testimonials'),
      projects: of('projects'),
      posts: of('posts'),
    };
  }

  /**
   * Copies what the site shows today into the dashboard. Only fills what is still empty, unless
   * `force` replaces the collections and settings (edited page texts are never touched).
   */
  async importFromSite(force: boolean): Promise<{ imported: string[] }> {
    let defaults;
    try {
      defaults = await this.site.defaults();
    } catch (error) {
      throw new BadRequestException(`تعذّر قراءة محتوى الموقع: ${error instanceof Error ? error.message : ''}`);
    }
    const imported: string[] = [];
    for (const key of COLLECTIONS) {
      const count = await this.prisma.collectionItem.count({ where: { collection: key } });
      if (count > 0 && !force) continue;
      const items = (defaults[key] ?? []) as object[];
      await this.prisma.$transaction([
        this.prisma.collectionItem.deleteMany({ where: { collection: key } }),
        ...items.map((data, position) => this.prisma.collectionItem.create({ data: { collection: key, position, data } })),
      ]);
      imported.push(key);
    }
    if (force || !(await this.settings())) {
      await this.prisma.setting.upsert({
        where: { key: SETTINGS_KEY },
        create: { key: SETTINGS_KEY, value: defaults.settings },
        update: { value: defaults.settings },
      });
      imported.push('settings');
    }
    void this.site.revalidate();
    return { imported };
  }

  /** The site's bundled texts, so the editor can show the current value of every key. */
  async defaultTexts(): Promise<TextOverrides> {
    try {
      return (await this.site.defaults()).texts;
    } catch {
      throw new BadRequestException('تعذّر الوصول للموقع لقراءة النصوص الأصلية.');
    }
  }

  private async find(collection: CollectionKey, id: string): Promise<Row> {
    const row = await this.prisma.collectionItem.findUnique({ where: { id } });
    if (!row || row.collection !== collection) throw new NotFoundException();
    return row;
  }
}
