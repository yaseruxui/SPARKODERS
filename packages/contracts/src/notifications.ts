import { z } from 'zod';

export interface AppNotification {
  id: string;
  kind: 'enquiry' | 'system';
  title: string;
  body: string;
  /** Dashboard path to open. */
  link: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationList {
  items: AppNotification[];
  unread: number;
}

/** SMTP account the API sends from (new-enquiry alerts, invitations). */
export const mailSettingsSchema = z.object({
  host: z.string().trim().min(1).max(200),
  port: z.coerce.number().int().min(1).max(65535),
  /** true = TLS from the start (port 465); false = STARTTLS. */
  secure: z.boolean(),
  user: z.string().trim().max(200),
  /** Write-only: empty keeps the stored password. */
  password: z.string().max(500),
  fromName: z.string().trim().max(120),
  fromEmail: z.email().max(200),
  /** Also send every new enquiry to these addresses (besides dashboard users with inbox access). */
  notifyEmails: z.array(z.email().max(200)).max(10),
});
export type MailSettingsInput = z.infer<typeof mailSettingsSchema>;

/** What the dashboard reads back (never the password). */
export type MailSettingsView = Omit<MailSettingsInput, 'password'> & { hasPassword: boolean };

export const mailTestSchema = z.object({ to: z.email().max(200) });
