'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { CanvasSkeleton } from '@/components/feedback/canvas-skeleton';
import { ErrorBoundary } from '@/components/feedback/error-boundary';
import { ButtonLink } from '@/components/ui/button';
import { ArrowIcon } from '@/components/ui/icons';
import { gsap, motionQueries, useGSAP } from '@/lib/gsap';
import { cn } from '@/utils/cn';

const SparkScene = dynamic(() => import('./spark-scene'), {
  ssr: false,
  loading: () => <CanvasSkeleton />,
});

interface ScrubIntroProps {
  ariaLabel: string;
  /** Sentences; wrap a standout word in [[double brackets]] to give it the blue gradient. */
  paragraphs: readonly string[];
  scrollHint: string;
  /** Call to action that appears once the last sentence has resolved. */
  cta: { label: string; href: string };
}

/** Scroll distance per sentence, in viewport heights. */
const SCREENS_PER_SENTENCE = 1;

/** Share of a sentence's scroll segment spent revealing its words (the rest holds, then hands over). */
const REVEAL_SHARE = 0.72;

/**
 * Word wave, as in the Sekka "words" effect: each word slides in from 4rem along the reading
 * direction (0.85 units, expo-like ease) while it fades out of a 10px blur (0.75 units, linear),
 * successive words starting 0.075 units apart so many are in motion at once.
 */
const WAVE = { slide: 0.85, fade: 0.75, stagger: 0.075 } as const;

interface Word {
  text: string;
  accent: boolean;
}

const TATWEEL = /ـ/g;
const MARKUP = /\[\[|\]\]/g;

/** Splits a sentence into words, keeping [[accent]] markup on the words it wraps. */
function toWords(sentence: string): Word[] {
  const words: Word[] = [];
  let accent = false;
  for (const raw of sentence.split(/\s+/).filter(Boolean)) {
    const opens = raw.startsWith('[[');
    const closes = raw.endsWith(']]');
    if (opens) accent = true;
    words.push({ text: raw.replace(MARKUP, ''), accent });
    if (closes) accent = false;
  }
  return words;
}

/** What assistive tech reads: no markup, no decorative kashida. */
function plainText(sentence: string): string {
  return sentence.replace(MARKUP, '').replace(TATWEEL, '');
}

/**
 * The page's authored moment: the section pins, the 3D mark turns with the scroll, and each
 * sentence arrives as a wave of words that slide in and sharpen out of a blur, then hands over to
 * the next; after the last one a call to action appears. A scrubbed GSAP
 * timeline drives everything (`scrub: 1` catches up smoothly) and its progress feeds the 3D scene.
 * A dark scrim sits between the mark and the text so the words stay readable over it.
 * Reduced motion: no pin; all sentences are shown, sharp, one under another.
 */
export function ScrubIntro({ ariaLabel, paragraphs, scrollHint, cta }: ScrubIntroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const mm = gsap.matchMedia();

      mm.add(motionQueries.full, () => {
        const sentences = gsap.utils.toArray<HTMLElement>('[data-sentence]', section);
        const hint = section.querySelector('[data-scroll-hint]');
        const scrim = section.querySelector('[data-scrim]');
        const wordsOf = (sentence: HTMLElement) => gsap.utils.toArray<HTMLElement>('[data-word]', sentence);

        const cta = section.querySelector('[data-intro-cta]');
        const rtl = getComputedStyle(section).direction === 'rtl';
        // Words travel along the reading direction: from the right in Arabic, from the left in English.
        const offset = rtl ? '4rem' : '-4rem';

        gsap.set(sentences, { autoAlpha: 0, y: 24 });
        gsap.set(sentences[0] ?? [], { autoAlpha: 1, y: 0 });
        gsap.set(section.querySelectorAll('[data-word]'), { x: offset, autoAlpha: 0, filter: 'blur(10px)' });
        if (scrim) gsap.set(scrim, { opacity: 0.55 });
        if (cta) gsap.set(cta, { autoAlpha: 0, y: 24 });

        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${window.innerHeight * SCREENS_PER_SENTENCE * sentences.length}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
          onUpdate() {
            progressRef.current = timeline.progress();
          },
        });

        if (hint) timeline.to(hint, { autoAlpha: 0, duration: 0.15 }, 0);
        if (scrim) timeline.to(scrim, { opacity: 1, duration: 0.25 }, 0);

        sentences.forEach((sentence, index) => {
          const words = wordsOf(sentence);
          // Scale the wave so it fits the sentence's share of the scroll, whatever its length.
          const unit = REVEAL_SHARE / (WAVE.slide + WAVE.stagger * Math.max(words.length - 1, 0));
          const label = `sentence-${index}`;
          timeline
            // Later sentences start their wave as they fade in, so the handover never leaves a blank screen.
            .addLabel(label, index === 0 ? '>' : '<')
            .to(words, { x: 0, duration: WAVE.slide * unit, stagger: WAVE.stagger * unit, ease: 'expo.out' }, label)
            .to(
              words,
              {
                autoAlpha: 1,
                filter: 'blur(0px)',
                duration: WAVE.fade * unit,
                stagger: WAVE.stagger * unit,
                ease: 'none',
              },
              label,
            );
          const next = sentences[index + 1];
          if (!next) {
            if (cta) timeline.to(cta, { autoAlpha: 1, y: 0, duration: 0.18, ease: 'power3.out' }, '>-0.05');
            timeline.to({}, { duration: 0.3 });
            return;
          }
          timeline
            .to({}, { duration: 0.12 })
            .to(sentence, { autoAlpha: 0, y: -24, filter: 'blur(8px)', duration: 0.28, ease: 'power2.in' })
            .to(next, { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power2.out' }, '<0.1');
        });
      });

      mm.add(motionQueries.reduced, () => {
        progressRef.current = 0.15;
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} aria-label={ariaLabel} className="relative h-svh overflow-hidden motion-reduce:h-auto">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(32%_42%_at_50%_52%,rgb(110_41_172/0.38),transparent_70%),radial-gradient(22%_30%_at_50%_55%,rgb(12_142_199/0.22),transparent_70%)]"
      />
      {/* The mark sits centre stage behind the sentence, as in the reference layout. */}
      <div className="pointer-events-none absolute inset-0 pt-(--header-h) opacity-85 motion-reduce:hidden">
        <ErrorBoundary fallback={<CanvasSkeleton />}>
          <SparkScene progressRef={progressRef} distance={11} />
        </ErrorBoundary>
      </div>
      {/* Dark scrim between the mark and the words, so the text always reads over the 3D object. */}
      <div
        data-scrim=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(46%_30%_at_50%_54%,rgb(7_5_26/0.78),rgb(7_5_26/0.45)_55%,transparent_82%)] motion-reduce:hidden"
      />
      <div className="container-site relative grid h-full place-items-center pt-(--header-h) text-center motion-reduce:py-24">
        <div className="relative grid w-full max-w-[min(100%,72rem)] motion-reduce:gap-8">
          {paragraphs.map((sentence) => (
            <p
              key={sentence}
              data-sentence=""
              className="col-start-1 row-start-1 self-center font-display text-[clamp(2rem,4.8vw,4.75rem)] leading-[1.35] font-extrabold motion-reduce:row-auto"
            >
              <span className="sr-only">{plainText(sentence)}</span>
              <span aria-hidden="true">
                {toWords(sentence).map((word, index) => (
                  <span key={index}>
                    <span
                      data-word=""
                      className={cn('inline-block will-change-[filter,opacity]', word.accent && 'text-gradient-blue')}
                    >
                      {word.text}
                    </span>{' '}
                  </span>
                ))}
              </span>
            </p>
          ))}
          <div data-intro-cta="" className="col-start-1 row-start-2 mt-[clamp(24px,4vh,44px)] flex justify-center">
            <ButtonLink href={cta.href}>
              {cta.label}
              <ArrowIcon />
            </ButtonLink>
          </div>
        </div>
      </div>
      <p data-scroll-hint="" className="label-sm absolute bottom-6 left-1/2 -translate-x-1/2 motion-reduce:hidden">
        {scrollHint} ↓
      </p>
    </section>
  );
}
