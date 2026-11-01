import { z } from 'zod';
import { INTEREST_KEYS, MESSAGE_STATUSES } from './contact';

export const inboxNoteSchema = z.object({
  id: z.string(),
  body: z.string(),
  author: z.object({ id: z.string(), name: z.string() }).nullable(),
  createdAt: z.string(),
});
export type InboxNote = z.infer<typeof inboxNoteSchema>;

/** One enquiry as the dashboard sees it. */
export const inboxMessageSchema = z.object({
  id: z.string(),
  name: z.string(),
  organisation: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  interests: z.array(z.enum(INTEREST_KEYS)),
  message: z.string().nullable(),
  locale: z.string().nullable(),
  status: z.enum(MESSAGE_STATUSES),
  createdAt: z.string(),
  notes: z.array(inboxNoteSchema),
});
export type InboxMessage = z.infer<typeof inboxMessageSchema>;

export const inboxQuerySchema = z.object({
  status: z.enum(MESSAGE_STATUSES).optional(),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(5).max(100).default(20),
});
export type InboxQuery = z.infer<typeof inboxQuerySchema>;

export const statusUpdateSchema = z.object({ status: z.enum(MESSAGE_STATUSES) });
export const bulkStatusSchema = z.object({ ids: z.array(z.string()).min(1).max(200), status: z.enum(MESSAGE_STATUSES) });
export const bulkIdsSchema = z.object({ ids: z.array(z.string()).min(1).max(200) });
export const noteBodySchema = z.object({ body: z.string().trim().min(1).max(4000) });

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
}

/** Counts per status for the inbox tabs and the dashboard. */
export type StatusCounts = Record<(typeof MESSAGE_STATUSES)[number], number>;
