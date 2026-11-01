import { z } from 'zod';
import { interestKeys } from '../types';

const trimmed = (max: number) => z.string().trim().max(max);

export const contactSchema = z.object({
  name: trimmed(120).min(2),
  organisation: trimmed(160).min(2),
  email: z.email().max(200),
  phone: trimmed(40)
    .regex(/^[+\d\s()-]*$/)
    .optional()
    .transform((value) => (value === '' ? undefined : value)),
  interests: z.array(z.enum(interestKeys)).max(interestKeys.length),
  message: trimmed(4000).optional(),
  // Honeypot: real visitors never see or fill this field.
  website: z.literal('').optional(),
});

export type ContactPayload = z.infer<typeof contactSchema>;

/** Reads a FormData into the plain object shape the schemas expect. */
export function contactFormToObject(form: FormData): Record<string, unknown> {
  const text = (key: string) => {
    const value = form.get(key);
    return typeof value === 'string' ? value : undefined;
  };
  return {
    name: text('name'),
    organisation: text('organisation'),
    email: text('email'),
    phone: text('phone'),
    interests: form.getAll('interest').filter((value): value is string => typeof value === 'string'),
    message: text('message'),
    website: text('website'),
  };
}
