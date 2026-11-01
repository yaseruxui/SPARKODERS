import { cn } from '@/utils/cn';

/** Placeholder shown while a canvas scene's code is loading, or if it cannot run. */
export function CanvasSkeleton({ className, label }: { className?: string; label?: string }) {
  return (
    <div
      role={label ? 'status' : undefined}
      aria-label={label}
      className={cn(
        'absolute inset-0 bg-[radial-gradient(40%_40%_at_50%_50%,rgb(178_108_255/0.22),transparent_70%),radial-gradient(30%_30%_at_60%_60%,rgb(12_142_199/0.18),transparent_70%)] motion-safe:animate-pulse',
        className,
      )}
    />
  );
}
