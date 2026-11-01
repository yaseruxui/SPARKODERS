import { techStack, type Tech } from '../data/content';
import { readableBrandColor, techIcons } from '../lib/tech-icons';

/** A neutral cloud for technologies whose mark cannot be redistributed. */
const CLOUD_PATH = 'M7 18.5a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 8.5a4 4 0 0 1-.5 10H7Z';

function TechLogo({ tech }: { tech: Tech }) {
  const icon = tech.icon ? techIcons[tech.icon] : null;
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-7 shrink-0 transition-colors duration-250 group-hover/tech:text-(--brand)"
    >
      {icon ? (
        <path d={icon.path} fill="currentColor" />
      ) : (
        <path d={CLOUD_PATH} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      )}
    </svg>
  );
}

/** Endless strip of the technologies we build with; rendered twice so the -50% loop is seamless. */
export function TechMarquee({ label, ariaLabel }: { label: string; ariaLabel: string }) {
  return (
    <div
      aria-label={ariaLabel}
      className="mt-[clamp(48px,8vw,96px)] flex items-center gap-6 border-y border-line bg-ink-2/60 px-(--gutter) py-[22px] max-sm:flex-col max-sm:items-stretch max-sm:gap-3"
    >
      <p className="w-[7.5rem] shrink-0 font-display text-[0.8125rem] leading-normal font-semibold text-muted max-sm:w-auto">
        {label}
      </p>
      <div
        dir="ltr"
        className="group/mq min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
      >
        <ul className="flex w-max animate-marquee gap-14 group-hover/mq:[animation-play-state:paused]">
          {[...techStack, ...techStack].map((tech, index) => {
            const icon = tech.icon ? techIcons[tech.icon] : null;
            return (
              <li
                key={`${tech.name}-${index}`}
                aria-hidden={index >= techStack.length || undefined}
                style={{ '--brand': icon ? readableBrandColor(icon.hex) : 'var(--color-aqua)' }}
                className="group/tech flex items-center gap-3 font-display text-[1.375rem] font-semibold whitespace-nowrap text-faint transition-colors duration-250 hover:text-text"
              >
                <TechLogo tech={tech} />
                {tech.name}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
