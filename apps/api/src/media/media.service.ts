import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { MediaItem } from '@sparkoders/contracts';
import { randomBytes } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { env } from '../config/env';
import type { Media } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/** Largest upload accepted, in bytes. */
export const MAX_UPLOAD = 8 * 1024 * 1024;

/**
 * Recognised image types, detected from the file's first bytes (never from its name or the
 * browser's claim). SVG is refused: it can carry script and is served from the API's origin.
 */
function sniff(buffer: Buffer): { mime: string; ext: string } | null {
  const hex = buffer.subarray(0, 12).toString('hex');
  if (hex.startsWith('89504e470d0a1a0a')) return { mime: 'image/png', ext: 'png' };
  if (hex.startsWith('ffd8ff')) return { mime: 'image/jpeg', ext: 'jpg' };
  if (hex.startsWith('47494638')) return { mime: 'image/gif', ext: 'gif' };
  if (hex.startsWith('52494646') && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return { mime: 'image/webp', ext: 'webp' };
  if (buffer.subarray(4, 12).toString('ascii').startsWith('ftypavi')) return { mime: 'image/avif', ext: 'avif' };
  return null;
}

/** Local-disk storage. Swap these two functions for object storage (e.g. Vercel Blob) in production. */
const storage = {
  root: () => resolve(env().UPLOADS_DIR),
  async put(key: string, data: Buffer) {
    const path = join(storage.root(), key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, data);
  },
  async remove(key: string) {
    await rm(join(storage.root(), key), { force: true });
  },
  url: (key: string) => `${env().PUBLIC_URL}/uploads/${key}`,
};

export const uploadsRoot = storage.root;

function toItem(row: Media): MediaItem {
  return {
    id: row.id,
    url: storage.url(row.storedAs),
    filename: row.filename,
    mime: row.mime,
    size: row.size,
    alt: row.alt,
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<MediaItem[]> {
    return (await this.prisma.media.findMany({ orderBy: { createdAt: 'desc' } })).map(toItem);
  }

  async upload(file: { originalname: string; buffer: Buffer; size: number } | undefined): Promise<MediaItem> {
    if (!file) throw new BadRequestException('اختر ملفًا للرفع.');
    const type = sniff(file.buffer);
    if (!type) throw new BadRequestException('نوع الملف غير مدعوم. المسموح: PNG, JPG, WebP, AVIF, GIF.');
    const month = new Date().toISOString().slice(0, 7);
    const storedAs = `${month}/${randomBytes(12).toString('hex')}.${type.ext}`;
    await storage.put(storedAs, file.buffer);
    const filename = file.originalname.replace(/[^\p{L}\p{N}._ -]/gu, '').slice(0, 160) || `image.${type.ext}`;
    const row = await this.prisma.media.create({ data: { filename, storedAs, mime: type.mime, size: file.size } });
    return toItem(row);
  }

  async setAlt(id: string, alt: string): Promise<MediaItem> {
    await this.find(id);
    return toItem(await this.prisma.media.update({ where: { id }, data: { alt } }));
  }

  async remove(id: string): Promise<void> {
    const row = await this.find(id);
    await this.prisma.media.delete({ where: { id } });
    await storage.remove(row.storedAs);
  }

  private async find(id: string): Promise<Media> {
    const row = await this.prisma.media.findUnique({ where: { id } });
    if (!row) throw new NotFoundException();
    return row;
  }
}
