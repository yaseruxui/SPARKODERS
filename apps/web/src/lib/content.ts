import 'server-only';
import type {
  ContentDefaults,
  Localized,
  ServiceData,
  SiteSettings,
  TeamMemberData,
  TestimonialData,
} from '@sparkoders/contracts';
import { services, team, testimonials } from '@/features/home/data/content';
import type { AvatarVariant } from '@/features/home/components/arab-avatar';
import { getCms, flatten } from '@/lib/cms';
import { site } from '@/lib/config/site';
import type { Locale } from '@/lib/i18n/routing';
import { loadMessages } from '@/messages';

/** Bundled content in the dashboard's shapes: what the site shows when nothing was edited. */
export async function bundledContent(): Promise<ContentDefaults> {
  const [ar, en] = await Promise.all([loadMessages('ar'), loadMessages('en')]);
  const both = (pick: (m: typeof ar) => string): Localized => ({ ar: pick(ar), en: pick(en) });

  const serviceItems: ServiceData[] = services.map((key) => ({
    icon: key,
    image: `/images/services/${key}.webp`,
    title: both((m) => m.home.services.items[key].title),
    body: both((m) => m.home.services.items[key].body),
    alt: both((m) => m.home.services.items[key].alt),
    intro: both((m) => m.pages.services.items[key].intro),
    forWho: both((m) => m.pages.services.items[key].forWho),
    deliverables: { ar: [...ar.pages.services.items[key].deliverables], en: [...en.pages.services.items[key].deliverables] },
  }));
  const teamItems: TeamMemberData[] = team.map((member) => ({
    name: both((m) => m.home.team.members[member.key].name),
    role: both((m) => m.home.team.members[member.key].role),
    bio: both((m) => m.home.team.members[member.key].bio),
    image: member.image,
  }));
  const testimonialItems: TestimonialData[] = testimonials.map((item) => ({
    quote: both((m) => m.home.testimonials.items[item.key].quote),
    name: both((m) => m.home.testimonials.items[item.key].name),
    role: both((m) => m.home.testimonials.items[item.key].role),
    image: item.image,
  }));

  // Texts handled as collections above are left out of the page-text editor.
  const collectionKeys = /^(home\.services\.items|home\.team\.members|home\.testimonials\.items|pages\.services\.items)\./;
  const texts = (messages: unknown) =>
    Object.fromEntries(Object.entries(flatten(messages)).filter(([key]) => !collectionKeys.test(key)));

  return {
    settings: {
      email: site.email,
      phone: site.phone,
      whatsapp: site.whatsapp,
      socials: Object.fromEntries(site.socials.map((s) => [s.key, s.href === '#' ? '' : s.href])) as SiteSettings['socials'],
    },
    services: serviceItems,
    team: teamItems,
    testimonials: testimonialItems,
    texts: { ar: texts(ar), en: texts(en) },
  };
}

/** Contact details: edited in the dashboard, else the site config. */
export async function getContact() {
  const settings = (await getCms())?.settings;
  const email = settings?.email ?? site.email;
  const phone = settings?.phone || site.phone;
  return {
    email,
    phone,
    phoneDisplay: settings?.phone || site.phoneDisplay,
    whatsapp: settings?.whatsapp || site.whatsapp,
    socials: site.socials.map((s) => ({ key: s.key, href: settings?.socials[s.key] || s.href })),
  };
}

const pick = (text: Localized, locale: Locale) => text[locale] || text.ar;

export interface ServiceView {
  key: string;
  icon: ServiceData['icon'];
  image: string | null;
  title: string;
  body: string;
  intro: string;
  forWho: string;
  deliverables: string[];
  alt: string;
}

export async function getServices(locale: Locale): Promise<ServiceView[]> {
  const cms = (await getCms())?.services;
  const items = cms?.length ? cms : (await bundledContent()).services;
  return items.map((s, index) => ({
    key: `${s.icon}-${index}`,
    icon: s.icon,
    image: s.image,
    title: pick(s.title, locale),
    body: pick(s.body, locale),
    intro: pick(s.intro, locale),
    forWho: pick(s.forWho, locale),
    deliverables: s.deliverables[locale].length ? s.deliverables[locale] : s.deliverables.ar,
    alt: pick(s.alt, locale),
  }));
}

export interface TeamView {
  key: string;
  name: string;
  role: string;
  bio: string;
  image: string | null;
}

export async function getTeam(locale: Locale): Promise<TeamView[]> {
  const cms = (await getCms())?.team;
  const items = cms?.length ? cms : (await bundledContent()).team;
  return items.map((m, index) => ({
    key: `member-${index}`,
    name: pick(m.name, locale),
    role: pick(m.role, locale),
    bio: pick(m.bio, locale),
    image: m.image,
  }));
}

const AVATARS: readonly AvatarVariant[] = ['shemagh', 'hijab', 'ghutra', 'hijabLight'];

export interface TestimonialView {
  key: string;
  quote: string;
  name: string;
  role: string;
  image: string | null;
  avatar: AvatarVariant;
}

export async function getTestimonials(locale: Locale): Promise<TestimonialView[]> {
  const cms = (await getCms())?.testimonials;
  const items = cms?.length ? cms : (await bundledContent()).testimonials;
  return items.map((t, index) => ({
    key: `testimonial-${index}`,
    quote: pick(t.quote, locale),
    name: pick(t.name, locale),
    role: pick(t.role, locale),
    image: t.image,
    avatar: AVATARS[index % AVATARS.length] ?? 'shemagh',
  }));
}
