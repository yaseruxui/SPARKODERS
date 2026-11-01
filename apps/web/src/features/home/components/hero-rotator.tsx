'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/cn';

const INTERVAL_MS = 2600;
const LEAVE_MS = 800;

/** Cycles through sector words under the hero headline. */
export function HeroRotator({ words }: { words: readonly string[] }) {
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const activeRef = useRef(0);

  useEffect(() => {
    if (words.length < 2) return;
    let leaveTimer = 0;
    const id = window.setInterval(() => {
      const current = activeRef.current;
      activeRef.current = (current + 1) % words.length;
      setLeaving(current);
      setActive(activeRef.current);
      window.clearTimeout(leaveTimer);
      leaveTimer = window.setTimeout(() => setLeaving(null), LEAVE_MS);
    }, INTERVAL_MS);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(leaveTimer);
    };
  }, [words.length]);

  return (
    <span className="relative block h-[1.32em] max-sm:text-[0.82em]">
      {words.map((word, index) => (
        <span
          key={word}
          aria-hidden={index !== active}
          className={cn(
            'text-gradient absolute start-0 top-0 whitespace-nowrap transition-[opacity,translate,filter] duration-[500ms,700ms,500ms] ease-brand motion-reduce:transition-opacity',
            index === active
              ? 'translate-y-0 opacity-100 blur-none delay-200'
              : index === leaving
                ? '-translate-y-[45%] opacity-0 blur-[6px] motion-reduce:translate-y-0 motion-reduce:blur-none'
                : 'translate-y-[45%] opacity-0 blur-[6px] motion-reduce:translate-y-0 motion-reduce:blur-none',
          )}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
