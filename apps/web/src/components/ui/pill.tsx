import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Pill({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-line-strong px-[0.9em] py-[0.2em] text-[0.8125rem] whitespace-nowrap text-muted',
        className,
      )}
      {...props}
    />
  );
}
