import { Injectable, NotFoundException } from '@nestjs/common';
import {
  type ContactSubmission,
  INTEREST_KEYS,
  type InboxMessage,
  type InboxQuery,
  type InterestKey,
  MESSAGE_STATUSES,
  type MessageStatus,
  type Paginated,
  type StatusCounts,
} from '@sparkoders/contracts';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const withNotes = { notes: { orderBy: { createdAt: 'asc' }, include: { author: true } } } satisfies Prisma.ContactMessageInclude;
type MessageRow = Prisma.ContactMessageGetPayload<{ include: typeof withNotes }>;

function toMessage(row: MessageRow): InboxMessage {
  const interests = Array.isArray(row.interests) ? row.interests : [];
  return {
    id: row.id,
    name: row.name,
    organisation: row.organisation,
    email: row.email,
    phone: row.phone,
    interests: interests.filter((i): i is InterestKey => (INTEREST_KEYS as readonly unknown[]).includes(i)),
    message: row.message,
    locale: row.locale,
    status: (MESSAGE_STATUSES as readonly string[]).includes(row.status) ? (row.status as MessageStatus) : 'new',
    createdAt: row.createdAt.toISOString(),
    notes: row.notes.map((note) => ({
      id: note.id,
      body: note.body,
      author: note.author ? { id: note.author.id, name: note.author.name } : null,
      createdAt: note.createdAt.toISOString(),
    })),
  };
}

@Injectable()
export class InboxService {
  constructor(private readonly prisma: PrismaService) {}

  /** Stores an enquiry from the site's contact form. */
  async receive(submission: ContactSubmission): Promise<{ id: string }> {
    const { payload, locale } = submission;
    const row = await this.prisma.contactMessage.create({
      data: {
        name: payload.name,
        organisation: payload.organisation,
        email: payload.email,
        phone: payload.phone || null,
        interests: payload.interests,
        message: payload.message || null,
        locale: locale ?? null,
      },
    });
    return { id: row.id };
  }

  async list(query: InboxQuery): Promise<Paginated<InboxMessage>> {
    const where: Prisma.ContactMessageWhereInput = {
      status: query.status,
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q } },
              { organisation: { contains: query.q } },
              { email: { contains: query.q } },
              { message: { contains: query.q } },
            ],
          }
        : {}),
    };
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.contactMessage.count({ where }),
      this.prisma.contactMessage.findMany({
        where,
        include: withNotes,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.perPage,
        take: query.perPage,
      }),
    ]);
    return { items: rows.map(toMessage), total, page: query.page, perPage: query.perPage };
  }

  async counts(): Promise<StatusCounts> {
    const groups = await this.prisma.contactMessage.groupBy({ by: ['status'], _count: { _all: true } });
    const counts = Object.fromEntries(MESSAGE_STATUSES.map((s: MessageStatus) => [s, 0])) as StatusCounts;
    for (const group of groups) {
      if (group.status in counts) counts[group.status as MessageStatus] = group._count._all;
    }
    return counts;
  }

  async get(id: string): Promise<InboxMessage> {
    const row = await this.prisma.contactMessage.findUnique({ where: { id }, include: withNotes });
    if (!row) throw new NotFoundException();
    return toMessage(row);
  }

  async setStatus(ids: string[], status: MessageStatus): Promise<void> {
    await this.prisma.contactMessage.updateMany({ where: { id: { in: ids } }, data: { status } });
  }

  async remove(ids: string[]): Promise<void> {
    await this.prisma.contactMessage.deleteMany({ where: { id: { in: ids } } });
  }

  async addNote(messageId: string, authorId: string, body: string): Promise<InboxMessage> {
    await this.get(messageId);
    await this.prisma.contactMessageNote.create({ data: { messageId, authorId, body } });
    return this.get(messageId);
  }

  async removeNote(noteId: string): Promise<void> {
    await this.prisma.contactMessageNote.deleteMany({ where: { id: noteId } });
  }

  /** Every message (optionally one status) as CSV, UTF-8 with BOM so Excel shows Arabic correctly. */
  async exportCsv(status?: MessageStatus): Promise<string> {
    const rows = await this.prisma.contactMessage.findMany({
      where: { status },
      include: withNotes,
      orderBy: { createdAt: 'desc' },
    });
    const header = ['date', 'status', 'name', 'organisation', 'email', 'phone', 'interests', 'message', 'locale'];
    const cell = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const lines = rows.map(toMessage).map((m) =>
      [m.createdAt, m.status, m.name, m.organisation, m.email, m.phone ?? '', m.interests.join(' | '), m.message ?? '', m.locale ?? '']
        .map(cell)
        .join(','),
    );
    return `﻿${[header.join(','), ...lines].join('\r\n')}`;
  }
}
