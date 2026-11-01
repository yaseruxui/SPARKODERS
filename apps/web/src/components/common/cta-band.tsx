import { ButtonLink } from '@/components/ui/button';
import { ArrowIcon } from '@/components/ui/icons';

/** Closing call to action on inner pages, leading to the contact form on the home page. */
export function CtaBand({ title, body, label, href }: { title: string; body: string; label: string; href: string }) {
  return (
    <section className="py-[clamp(64px,9vw,120px)]">
      <div className="container-site">
        <div className="relative overflow-hidden rounded-[32px] bg-[radial-gradient(60%_90%_at_100%_0%,rgb(178_108_255/0.4),transparent_60%),radial-gradient(60%_90%_at_0%_100%,rgb(127_238_250/0.22),transparent_60%),var(--grad-soft)] px-[clamp(24px,5vw,72px)] py-[clamp(36px,5vw,64px)]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="font-display text-[clamp(1.8rem,3.6vw,2.8rem)] leading-[1.25] font-extrabold">{title}</h2>
              <p className="mt-3 text-lg text-text/85">{body}</p>
            </div>
            <ButtonLink href={href} variant="light">
              {label}
              <ArrowIcon />
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
