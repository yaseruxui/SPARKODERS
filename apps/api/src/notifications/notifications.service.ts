import { Injectable } from '@nestjs/common';
import { type AppNotification, type ContactSubmission, INTEREST_KEYS, type NotificationList } from '@sparkoders/contracts';
import { env } from '../config/env';
import { hasPermission, parsePermissions } from '../common/permissions';
import type { Notification } from '../generated/prisma/client';
import { emailHtml, MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

const interestNames: Record<(typeof INTEREST_KEYS)[number], string> = {
  website: 'موقع إلكتروني',
  store: 'متجر إلكتروني',
  app: 'تطبيق جوال',
  branding: 'هوية وتسويق',
  seo: 'محركات البحث',
  ai: 'ذكاء اصطناعي',
};

function toView(row: Notification): AppNotification {
  return {
    id: row.id,
    kind: row.kind === 'enquiry' ? 'enquiry' : 'system',
    title: row.title,
    body: row.body,
    link: row.link,
    read: !!row.readAt,
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async list(userId: string): Promise<NotificationList> {
    const [items, unread] = await Promise.all([
      this.prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 20 }),
      this.prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    return { items: items.map(toView), unread };
  }

  async read(userId: string, id?: string): Promise<void> {
    await this.prisma.notification.updateMany({ where: { userId, readAt: null, ...(id ? { id } : {}) }, data: { readAt: new Date() } });
  }

  /** A new enquiry: a notification for every active user with inbox access, and an email to them. */
  async enquiry(messageId: string, submission: ContactSubmission): Promise<void> {
    const { payload } = submission;
    const users = (await this.prisma.user.findMany({ where: { passwordHash: { not: null } } })).filter((u) =>
      hasPermission(parsePermissions(u.permissions), 'inbox'),
    );
    const title = `طلب جديد من ${payload.name}`;
    const body = [payload.organisation, payload.interests.map((i) => interestNames[i]).join('، ')].filter(Boolean).join(' · ');
    const link = `/inbox?open=${messageId}`;
    await this.prisma.notification.createMany({ data: users.map((u) => ({ userId: u.id, kind: 'enquiry', title, body, link })) });

    const to = [...new Set([...users.map((u) => u.email), ...(await this.mail.notifyEmails())])];
    if (!to.length) return;
    const lines = [
      `الاسم: ${payload.name}`,
      `الجهة: ${payload.organisation}`,
      `البريد: ${payload.email}`,
      ...(payload.phone ? [`الجوال: ${payload.phone}`] : []),
      ...(payload.interests.length ? [`الخدمات: ${payload.interests.map((i) => interestNames[i]).join('، ')}`] : []),
      ...(payload.message ? [`الرسالة: ${payload.message}`] : []),
    ];
    void this.mail.send({
      to,
      subject: title,
      text: lines.join('\n'),
      html: emailHtml(title, lines, { label: 'افتح الطلب في اللوحة', url: `${env().ADMIN_URL}${link}` }),
    });
  }
}
