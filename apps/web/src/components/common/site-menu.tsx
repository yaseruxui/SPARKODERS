'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowIcon } from '@/components/ui/icons';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export interface MenuLink {
  href: string;
  label: string;
}

export interface SocialLink extends MenuLink {
  /** 24×24 glyph path. */
  icon: string;
}

interface SiteMenuProps {
  items: readonly MenuLink[];
  socials: readonly SocialLink[];
  labels: { open: string; close: string; nav: string; followUs: string; note: string; ctaTitle: string; cta: string };
  email: string;
  contactHref: string;
}

const CLOSE_MS = 350;

/**
 * Full-screen menu: toggle button + overlay. The overlay is portalled to <body> so the frosted
 * header (which creates a containing block via backdrop-filter) stays above it. Escape closes it.
 */
export function SiteMenu({ items, socials, labels, email, contactHref }: SiteMenuProps) {
  /** `rendered` keeps the overlay in the DOM during its fade-out; `open` drives the fade itself. */
  const [rendered, setRendered] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const closeTimer = useRef(0);

  const show = () => {
    window.clearTimeout(closeTimer.current);
    setRendered(true);
    requestAnimationFrame(() => setOpen(true));
  };

  const hide = (restoreFocus = false) => {
    setOpen(false);
    closeTimer.current = window.setTimeout(() => setRendered(false), CLOSE_MS);
    if (restoreFocus) toggleRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    firstLinkRef.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      closeTimer.current = window.setTimeout(() => setRendered(false), CLOSE_MS);
      toggleRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label={open ? labels.close : labels.open}
        onClick={() => (open ? hide() : show())}
        className="group/menu relative grid size-11 cursor-pointer place-items-center transition-[scale] duration-300 ease-brand active:scale-[0.94]"
      >
        {/* Two lines, the lower one shorter: on hover they even out, when open they fold into an ×. */}
        <span aria-hidden="true" className="relative block h-3 w-6">
          <i
            className={cn(
              'absolute start-0 top-0 block h-0.5 w-6 rounded-full bg-current transition-[translate,rotate] duration-400 ease-brand',
              open && 'translate-y-[5px] rotate-45',
            )}
          />
          <i
            className={cn(
              'absolute start-0 top-[10px] block h-0.5 rounded-full bg-current transition-[translate,rotate,width] duration-400 ease-brand',
              open ? 'w-6 -translate-y-[5px] -rotate-45' : 'w-4 group-hover/menu:w-6',
            )}
          />
        </span>
      </button>

      {rendered
        ? createPortal(
            <nav
              id="site-menu"
              aria-label={labels.nav}
              className={cn(
                'fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ink pt-[calc(var(--header-h)+16px)] pb-6 transition-opacity duration-350 ease-brand',
                'bg-[radial-gradient(60%_60%_at_15%_85%,rgb(12_142_199/0.25),transparent_70%),radial-gradient(50%_50%_at_85%_15%,rgb(178_108_255/0.22),transparent_70%)]',
                open ? 'opacity-100' : 'opacity-0',
              )}
            >
              <div className="container-site grid flex-1 content-center items-center gap-[clamp(16px,4vh,56px)] lg:grid-cols-[1.35fr_1fr] lg:gap-[clamp(48px,7vw,120px)]">
                <ol>
                  {items.map((item, index) => (
                    <li
                      key={item.href}
                      // Links rise in one after another as the menu opens.
                      style={{ transitionDelay: open ? `${80 + index * 45}ms` : '0ms' }}
                      className={cn(
                        'transition-[opacity,translate] duration-500 ease-brand motion-reduce:translate-y-0',
                        open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
                      )}
                    >
                      <a
                        ref={index === 0 ? firstLinkRef : undefined}
                        href={item.href}
                        onClick={() => hide()}
                        className="group/link flex items-center gap-[clamp(12px,2vw,24px)] py-[clamp(3px,1.2svh,14px)]"
                      >
                        <span className="w-7 font-display text-sm text-faint tabular-nums transition-colors duration-300 group-hover/link:text-aqua">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="font-display text-[clamp(1.45rem,min(4.4vw,5.6svh),3.25rem)] leading-[1.3] font-extrabold transition-[color,translate] duration-400 ease-brand group-hover/link:-translate-x-2 group-hover/link:text-aqua ltr:group-hover/link:translate-x-2">
                          {item.label}
                        </span>
                        <ArrowIcon className="ms-auto size-7 text-aqua opacity-0 transition-[opacity,translate] duration-400 ease-brand group-hover/link:opacity-100 max-sm:hidden" />
                      </a>
                    </li>
                  ))}
                </ol>

                <div
                  style={{ transitionDelay: open ? '220ms' : '0ms' }}
                  className={cn(
                    'rounded-panel bg-white/[0.04] p-[clamp(16px,3vw,36px)] shadow-[inset_0_0_0_1px_var(--color-line-strong)] backdrop-blur-sm transition-[opacity,translate] duration-500 ease-brand motion-reduce:translate-y-0',
                    open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
                  )}
                >
                  <p className="font-display text-[clamp(1.4rem,2.4vw,2rem)] leading-[1.35] font-extrabold">
                    {labels.ctaTitle}
                  </p>
                  <p className="mt-2 text-muted max-sm:hidden">{labels.note}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 sm:mt-5">
                    <a href={contactHref} onClick={() => hide()} className={buttonVariants({ size: 'md' })}>
                      {labels.cta}
                      <ArrowIcon />
                    </a>
                    <a
                      href={`mailto:${email}`}
                      dir="ltr"
                      className="text-[0.9375rem] text-muted underline-offset-4 transition-colors hover:text-aqua hover:underline"
                    >
                      {email}
                    </a>
                  </div>
                  <div className="mt-4 border-t border-line pt-4 sm:mt-6 sm:pt-5">
                    <p className="label-sm max-sm:sr-only">{labels.followUs}</p>
                    <ul className="flex flex-wrap gap-2.5 sm:mt-3">
                      {socials.map((social) => (
                        <li key={social.label}>
                          <a
                            href={social.href}
                            rel="noopener"
                            aria-label={social.label}
                            title={social.label}
                            className="grid size-11 place-items-center rounded-full text-muted shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-[color,box-shadow,background-color,translate] duration-300 ease-brand hover:-translate-y-0.5 hover:bg-white/5 hover:text-aqua hover:shadow-[inset_0_0_0_1px_rgb(127_238_250/0.5)]"
                          >
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px]" fill="currentColor">
                              <path d={social.icon} />
                            </svg>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </nav>,
            document.body,
          )
        : null}
    </>
  );
}
