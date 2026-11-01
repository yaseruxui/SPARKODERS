'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, motionQueries, useGSAP } from '@/lib/gsap';
import { cn } from '@/utils/cn';

export interface CodeStageCopy {
  /** Headline written into the code (the component's title prop). */
  storeHeadline: string;
  website: { title: string; detail: string };
  app: { title: string; detail: string };
}

type Token = readonly [kind: 'kw' | 'tag' | 'attr' | 'str' | 'num' | 'pun' | 'txt', text: string];

/** The component being "written": a small store page, highlighted with brand colours. */
function codeLines(headline: string): readonly (readonly Token[])[] {
  return [
    [
      ['kw', 'import'],
      ['pun', ' { '],
      ['tag', 'Hero'],
      ['pun', ', '],
      ['tag', 'Products'],
      ['pun', ', '],
      ['tag', 'Checkout'],
      ['pun', ' } '],
      ['kw', 'from'],
      ['str', " '@/ui'"],
      ['pun', ';'],
    ],
    [],
    [
      ['kw', 'export default function'],
      ['txt', ' Store'],
      ['pun', '() {'],
    ],
    [
      ['kw', '  return'],
      ['pun', ' ('],
    ],
    [
      ['pun', '    <'],
      ['tag', 'Hero'],
      ['attr', ' title'],
      ['pun', '='],
      ['str', `"${headline}"`],
      ['pun', ' />'],
    ],
    [
      ['pun', '    <'],
      ['tag', 'Products'],
      ['attr', ' columns'],
      ['pun', '={'],
      ['num', '3'],
      ['pun', '} />'],
    ],
    [
      ['pun', '    <'],
      ['tag', 'Checkout'],
      ['attr', ' pay'],
      ['pun', '='],
      ['str', '"mada"'],
      ['pun', ' />'],
    ],
    [['pun', '  );']],
    [['pun', '}']],
  ];
}

const TOKEN_CLASS: Record<Token[0], string> = {
  kw: 'text-[#c79bff]',
  tag: 'text-aqua',
  attr: 'text-[#8fb4ff]',
  str: 'text-[#ffcb8b]',
  num: 'text-[#ff9db5]',
  pun: 'text-[#8a84b8]',
  txt: 'text-text',
};

const ARABIC = /[\u0600-\u06FF]/;

/** Seconds the first-visit logo intro covers the page (matches HeroIntro). */
const LOADER_HOLD = 1.55;

function BrowserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M3 9h18M7 6.5h.01M10 6.5h.01" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="6" y="2.5" width="12" height="19" rx="3" />
      <path d="M10.5 18.5h3" />
    </svg>
  );
}

function OutputCard({
  icon,
  title,
  detail,
  tone,
  className,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  tone: 'aqua' | 'violet';
  className?: string;
}) {
  return (
    <div
      data-output-card=""
      className={cn(
        'absolute flex items-center gap-3 rounded-2xl bg-ink-2/90 py-3 ps-3 pe-5 shadow-[0_30px_60px_-24px_rgb(0_0_0/0.9),inset_0_0_0_1px_var(--color-line-strong)] backdrop-blur-[6px]',
        className,
      )}
    >
      <span
        className={cn(
          'grid size-12 shrink-0 place-items-center rounded-xl',
          tone === 'aqua'
            ? 'bg-[linear-gradient(135deg,var(--color-aqua),var(--color-ocean))] text-ink'
            : 'bg-[linear-gradient(135deg,var(--color-violet),var(--color-plum))] text-white',
        )}
      >
        {icon}
      </span>
      <span>
        <b className="block font-display text-base leading-tight">{title}</b>
        <span className="mt-1 flex items-center gap-1.5 text-sm text-muted">
          <span data-output-check="" className="grid size-4 place-items-center rounded-full bg-[#34d399] text-ink">
            <svg
              viewBox="0 0 12 12"
              className="size-2.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2.5 6.2 5 8.5l4.5-5" />
            </svg>
          </span>
          {detail}
        </span>
      </span>
    </div>
  );
}

/**
 * Hero visual: code for a small store is typed into an editor; when it finishes, two cards pop
 * in beside it — the website and the mobile app it ships as. Loops while visible; reduced motion
 * shows the finished state. Purely illustrative, so it is hidden from assistive tech.
 */
export function HeroCodeStage({ copy }: { copy: CodeStageCopy }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lines = codeLines(copy.storeHeadline);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);

      mm.add(motionQueries.full, () => {
        const codeLineEls = q('[data-code-line]');
        const carets = q('[data-caret]');
        const editor = q('[data-editor]');
        const cards = q('[data-output-card]');
        const checks = q('[data-output-check]');
        const delay = document.documentElement.dataset.intro === 'playing' ? LOADER_HOLD + 0.6 : 0.7;

        gsap.set(root, { visibility: 'visible' });
        gsap.set(codeLineEls, { clipPath: 'inset(0 100% 0 0)' });
        gsap.set(carets, { autoAlpha: 0 });
        gsap.set(cards, { autoAlpha: 0, scale: 0.85, y: 16, filter: 'blur(6px)' });
        gsap.set(checks, { scale: 0 });

        gsap.from(editor, { autoAlpha: 0, y: 40, duration: 0.9, ease: 'expo.out', delay });

        const tl = gsap.timeline({ delay: delay + 0.4, repeat: -1, repeatDelay: 0.4 });
        codeLineEls.forEach((line, index) => {
          const chars = Math.max(1, line.textContent?.length ?? 1);
          const caret = carets[index];
          if (caret) tl.set(caret, { autoAlpha: 1 });
          tl.to(line, { clipPath: 'inset(0 0% 0 0)', duration: Math.min(1.1, chars * 0.028), ease: `steps(${chars})` });
          if (caret) tl.set(caret, { autoAlpha: 0 });
        });
        tl.to(
          cards,
          { autoAlpha: 1, scale: 1, y: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.18, ease: 'back.out(1.6)' },
          '+=0.2',
        )
          .to(checks, { scale: 1, duration: 0.35, stagger: 0.18, ease: 'back.out(2.5)' }, '<0.35')
          .to({}, { duration: 3.4 })
          .to(cards, { autoAlpha: 0, y: 12, filter: 'blur(4px)', duration: 0.45, stagger: 0.08, ease: 'power2.in' })
          .set(checks, { scale: 0 })
          .to(
            codeLineEls,
            { clipPath: 'inset(0 100% 0 0)', duration: 0.35, stagger: { each: 0.03, from: 'end' }, ease: 'power2.in' },
            '<',
          );

        const io = new IntersectionObserver(([entry]) => {
          if (entry?.isIntersecting) tl.resume();
          else tl.pause();
        });
        io.observe(root);
        return () => io.disconnect();
      });

      mm.add(motionQueries.reduced, () => {
        gsap.set(root, { visibility: 'visible' });
      });
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      data-hero-reveal=""
      aria-hidden="true"
      className="pointer-events-none relative mx-auto mt-12 mb-6 w-full max-w-[520px] select-none py-12 lg:m-0 lg:max-w-[580px] lg:justify-self-end"
    >
      <div
        data-editor=""
        dir="ltr"
        className="mx-[4%] overflow-hidden rounded-2xl bg-[#0d0a24] shadow-[0_50px_100px_-40px_rgb(0_0_0/0.95),0_0_0_1px_rgb(178_108_255/0.3),0_0_80px_-20px_rgb(110_41_172/0.45)]"
      >
        <div className="flex h-10 items-center gap-2 border-b border-white/5 bg-[#120e2c] px-4">
          <i className="size-3 rounded-full bg-[#ff5f57]" />
          <i className="size-3 rounded-full bg-[#febc2e]" />
          <i className="size-3 rounded-full bg-[#28c840]" />
          <span className="ms-3 rounded-md bg-[#1b1640] px-2.5 py-0.5 font-mono text-xs text-muted">Store.tsx</span>
        </div>
        <pre className="m-0 px-4 py-5 font-mono text-[clamp(9px,1.12vw,14px)] leading-[1.85] sm:px-5">
          {lines.map((tokens, index) => (
            <div key={index} className="flex">
              <span className="w-6 shrink-0 text-end text-[#4b4578] tabular-nums">{index + 1}</span>
              <span className="relative ms-4 whitespace-pre">
                <span data-code-line="" className="inline-block">
                  {tokens.length
                    ? tokens.map(([kind, text], i) => (
                        <span
                          key={i}
                          // Monospace faces cannot join Arabic letters; Arabic strings use the site face.
                          className={cn(TOKEN_CLASS[kind], ARABIC.test(text) && 'font-sans')}
                          dir={kind === 'str' ? 'auto' : undefined}
                        >
                          {text}
                        </span>
                      ))
                    : ' '}
                </span>
                <span data-caret="" className="absolute -end-1.5 top-[0.2em] h-[1.2em] w-[2px] animate-pulse bg-aqua" />
              </span>
            </div>
          ))}
        </pre>
      </div>

      <OutputCard
        icon={<BrowserIcon />}
        title={copy.website.title}
        detail={copy.website.detail}
        tone="aqua"
        className="-start-[2%] top-0 lg:-start-[6%]"
      />
      <OutputCard
        icon={<PhoneIcon />}
        title={copy.app.title}
        detail={copy.app.detail}
        tone="violet"
        className="-end-[2%] bottom-0 lg:-end-[6%]"
      />
    </div>
  );
}
