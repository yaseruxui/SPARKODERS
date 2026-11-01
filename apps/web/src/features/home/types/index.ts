import type { AvatarVariant } from '../components/arab-avatar';
import type { Messages } from '@/messages';

type Home = Messages['home'];

export type HeroWordKey = keyof Home['hero']['words'];
export type ProjectKey = keyof Home['work']['items'];
export type LeadTagKey = keyof Home['leads']['tags'];
export type DelightStepKey = keyof Home['delight']['steps'];
export type TeamMemberKey = keyof Home['team']['members'];
export type ServiceKey = keyof Home['services']['items'];
export type TestimonialKey = keyof Home['testimonials']['items'];
export type PostKey = keyof Home['blog']['items'];

/** 1–6: which brand gradient a card falls back to when it has no photo. */
export type Accent = 1 | 2 | 3 | 4 | 5 | 6;

export interface Project {
  key: ProjectKey;
  accent: Accent;
  /** Path under /public. `null` renders the brand-gradient artwork instead of a photo. */
  image: string | null;
}

export interface Post {
  key: PostKey;
  accent: Accent;
  /** ISO date; rendered with the locale's calendar formatting. */
  date: string;
  image: string | null;
}

export interface TeamMember {
  key: TeamMemberKey;
  /** Portrait in /public/images/team/ (pm and marketer are still AI-generated placeholders). */
  image: string;
}

/** Serializable copy handed from server components to client islands. */
export interface ProjectRow {
  key: ProjectKey;
  accent: Accent;
  href: string;
  image: string | null;
  title: string;
  category: string;
  alt: string;
}

/** A client voice. `image` is the client's own photo (with their permission); null shows the illustrated avatar. */
export interface Testimonial {
  key: TestimonialKey;
  /** Illustrated portrait drawn inline; replaced by `image` once a real client photo exists. */
  avatar: AvatarVariant;
  image: string | null;
}

/** Serializable testimonial handed to the client carousel. */
export interface Quote {
  key: TestimonialKey;
  quote: string;
  name: string;
  role: string;
  avatar: AvatarVariant;
  image: string | null;
  alt: string;
}
