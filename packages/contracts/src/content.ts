import { z } from 'zod';

/** A text in both site languages. */
export const localizedSchema = z.object({ ar: z.string().trim().max(4000), en: z.string().trim().max(4000) });
export type Localized = z.infer<typeof localizedSchema>;

export const localizedListSchema = z.object({
  ar: z.array(z.string().trim().max(300)).max(20),
  en: z.array(z.string().trim().max(300)).max(20),
});

/** Image reference: a site path (/images/…) or a media URL from the dashboard library. */
export const imageRefSchema = z.string().trim().max(1000).nullable();

export const SERVICE_ICONS = ['website', 'store', 'app', 'systems', 'branding', 'seo'] as const;
export type ServiceIcon = (typeof SERVICE_ICONS)[number];

export const serviceDataSchema = z.object({
  icon: z.enum(SERVICE_ICONS),
  image: imageRefSchema,
  title: localizedSchema,
  /** One line for the home page list. */
  body: localizedSchema,
  /** The longer paragraph on the services page. */
  intro: localizedSchema,
  forWho: localizedSchema,
  deliverables: localizedListSchema,
  alt: localizedSchema,
});
export type ServiceData = z.infer<typeof serviceDataSchema>;

export const teamMemberDataSchema = z.object({
  name: localizedSchema,
  role: localizedSchema,
  bio: localizedSchema,
  image: imageRefSchema,
});
export type TeamMemberData = z.infer<typeof teamMemberDataSchema>;

export const testimonialDataSchema = z.object({
  quote: localizedSchema,
  name: localizedSchema,
  role: localizedSchema,
  image: imageRefSchema,
});
export type TestimonialData = z.infer<typeof testimonialDataSchema>;

/** Collections edited as ordered lists in the dashboard. */
export const COLLECTIONS = ['services', 'team', 'testimonials'] as const;
export type CollectionKey = (typeof COLLECTIONS)[number];

export const collectionSchemas = {
  services: serviceDataSchema,
  team: teamMemberDataSchema,
  testimonials: testimonialDataSchema,
} as const;

export interface CollectionDataMap {
  services: ServiceData;
  team: TeamMemberData;
  testimonials: TestimonialData;
}

export interface CollectionItem<K extends CollectionKey = CollectionKey> {
  id: string;
  published: boolean;
  position: number;
  data: CollectionDataMap[K];
  updatedAt: string;
}

export const itemInputSchema = (key: CollectionKey) =>
  z.object({ published: z.boolean().default(true), data: collectionSchemas[key] });

export const reorderSchema = z.object({ ids: z.array(z.string()).min(1).max(500) });

export const SOCIAL_KEYS = ['linkedin', 'instagram', 'x', 'behance'] as const;
export type SocialKey = (typeof SOCIAL_KEYS)[number];

const optionalUrl = z.union([z.literal(''), z.url().max(500)]);

/** Contact details shown across the site (header, footer, contact page, WhatsApp button). */
export const siteSettingsSchema = z.object({
  email: z.email().max(200),
  phone: z.string().trim().max(40).regex(/^[+\d\s()-]*$/),
  /** International format, digits only. */
  whatsapp: z.string().trim().max(20).regex(/^\d*$/),
  socials: z.object({ linkedin: optionalUrl, instagram: optionalUrl, x: optionalUrl, behance: optionalUrl }),
});
export type SiteSettings = z.infer<typeof siteSettingsSchema>;

/**
 * Edited page texts: message keys (e.g. "home.hero.lead") to values, per language. Keys never
 * edited are absent, so the site keeps its bundled copy for them.
 */
export const textOverridesSchema = z.object({
  ar: z.record(z.string(), z.string()),
  en: z.record(z.string(), z.string()),
});
export type TextOverrides = z.infer<typeof textOverridesSchema>;

export const textUpdateSchema = z.object({
  locale: z.enum(['ar', 'en']),
  key: z.string().regex(/^[A-Za-z0-9_.-]+$/).max(200),
  /** null removes the override (back to the bundled text). */
  value: z.string().max(8000).nullable(),
});

/** What the site reads (GET /public/content). Empty collections mean "use the bundled copy". */
export interface PublicContent {
  settings: SiteSettings | null;
  texts: TextOverrides;
  services: CollectionItem<'services'>['data'][];
  team: CollectionItem<'team'>['data'][];
  testimonials: CollectionItem<'testimonials'>['data'][];
}

/** What the site bundles today, served once to fill an empty dashboard (GET {site}/api/content-defaults). */
export interface ContentDefaults {
  settings: SiteSettings;
  services: ServiceData[];
  team: TeamMemberData[];
  testimonials: TestimonialData[];
  /** Every message key → text, per language, for the page-text editor. */
  texts: TextOverrides;
}

export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  mime: string;
  size: number;
  alt: string;
  createdAt: string;
}
