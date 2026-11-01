import type { ReactNode } from 'react';
import { ArrowIcon } from '@/components/ui/icons';
import { Kashida } from '@/components/ui/kashida';

interface PageHeroProps {
  title: string;
  lead?: string;
  back?: { href: string; label: string };
  children?: ReactNode;
}

/** Opening block of an inner page: optional back link, the title (kashida-aware) and a lead. */
export function PageHero({ title, lead, back, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden pt-[calc(var(--header-h)+clamp(40px,7vw,96px))] pb-[clamp(32px,5vw,64px)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_60%_at_85%_0%,rgb(110_41_172/0.35),transparent_70%),radial-gradient(35%_50%_at_10%_20%,rgb(12_142_199/0.18),transparent_70%)]"
      />
      <div className="container-site relative">
        {back ? (
          <a
            href={back.href}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-aqua"
          >
            <ArrowIcon className="rotate-180" />
            {back.label}
          </a>
        ) : null}
        <h1 className="display-xl max-w-4xl">
          <Kashida text={title} />
        </h1>
        {lead ? <p className="mt-5 max-w-2xl text-lg text-muted sm:text-xl">{lead}</p> : null}
        {children}
      </div>
    </section>
  );
}
