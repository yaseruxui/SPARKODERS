import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { type MailSettingsInput, mailSettingsSchema, type MailSettingsView } from '@sparkoders/contracts';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { createTransport } from 'nodemailer';
import { env } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';

const KEY = 'mail';

type Stored = Omit<MailSettingsInput, 'password'> & { passwordEnc: string };

/** The SMTP password is stored encrypted (AES-256-GCM, key derived from JWT_SECRET). */
function key() {
  return createHash('sha256').update(`mail:${env().JWT_SECRET}`).digest();
}
function encrypt(text: string): string {
  if (!text) return '';
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const data = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString('base64')).join('.');
}
function decrypt(value: string): string {
  if (!value) return '';
  const [iv, tag, data] = value.split('.').map((p) => Buffer.from(p, 'base64'));
  if (!iv || !tag || !data) return '';
  const decipher = createDecipheriv('aes-256-gcm', key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

export interface Message {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async stored(): Promise<Stored | null> {
    const row = await this.prisma.setting.findUnique({ where: { key: KEY } });
    return (row?.value as Stored | undefined) ?? null;
  }

  async view(): Promise<MailSettingsView | null> {
    const s = await this.stored();
    if (!s) return null;
    const { passwordEnc, ...rest } = s;
    return { ...rest, hasPassword: !!passwordEnc };
  }

  async save(input: MailSettingsInput): Promise<MailSettingsView> {
    const current = await this.stored();
    const parsed = mailSettingsSchema.parse(input);
    const { password, ...rest } = parsed;
    const value: Stored = { ...rest, passwordEnc: password ? encrypt(password) : (current?.passwordEnc ?? '') };
    await this.prisma.setting.upsert({ where: { key: KEY }, create: { key: KEY, value }, update: { value } });
    return (await this.view())!;
  }

  async configured(): Promise<boolean> {
    return !!(await this.stored());
  }

  /** Extra addresses that receive every new enquiry. */
  async notifyEmails(): Promise<string[]> {
    return (await this.stored())?.notifyEmails ?? [];
  }

  /** Sends one message. Returns false (and logs) instead of throwing, unless `strict`. */
  async send(message: Message, strict = false): Promise<boolean> {
    const s = await this.stored();
    if (!s) {
      if (strict) throw new BadRequestException('إعدادات البريد غير مضبوطة.');
      return false;
    }
    try {
      const transport = createTransport({
        host: s.host,
        port: s.port,
        secure: s.secure,
        auth: s.user ? { user: s.user, pass: decrypt(s.passwordEnc) } : undefined,
        connectionTimeout: 10_000,
      });
      await transport.sendMail({ from: { name: s.fromName || 'SPARKODERS', address: s.fromEmail }, ...message });
      return true;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Mail failed: ${reason}`);
      if (strict) throw new BadRequestException(`تعذّر الإرسال: ${reason}`);
      return false;
    }
  }
}

/** Minimal branded HTML for system emails (RTL, inline styles only). */
export function emailHtml(title: string, lines: string[], action?: { label: string; url: string }): string {
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);
  return `<!doctype html><html lang="ar" dir="rtl"><body style="margin:0;background:#07051a;font-family:Tahoma,Arial,sans-serif;color:#f5f2ff">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<p style="font-weight:700;letter-spacing:.08em;color:#b26cff;margin:0 0 20px">SPARKODERS</p>
<div style="background:#0e0a26;border:1px solid #2a2150;border-radius:16px;padding:24px">
<h1 style="font-size:20px;margin:0 0 12px">${esc(title)}</h1>
${lines.map((l) => `<p style="margin:0 0 8px;line-height:1.7;color:#d9d4f5">${esc(l)}</p>`).join('')}
${action ? `<p style="margin:20px 0 0"><a href="${esc(action.url)}" style="display:inline-block;background:#b26cff;color:#14072a;text-decoration:none;font-weight:700;padding:10px 18px;border-radius:999px">${esc(action.label)}</a></p>` : ''}
</div></div></body></html>`;
}
