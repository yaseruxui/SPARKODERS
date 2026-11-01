import type { ReactNode } from 'react';
import mark from '@/assets/sparkoders-mark.webp';

/** Centered card for sign-in and invitation screens. */
export function AuthLayout({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="bg-background relative grid min-h-svh place-items-center overflow-hidden p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_50%_at_80%_10%,rgb(178_108_255/0.18),transparent_70%),radial-gradient(35%_45%_at_15%_90%,rgb(12_142_199/0.14),transparent_70%)]"
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <img src={mark} alt="SPARKODERS" className="w-14" />
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            {description && <p className="text-muted-foreground mt-1.5 text-sm">{description}</p>}
          </div>
        </div>
        <div className="bg-card rounded-xl border p-6 shadow-sm">{children}</div>
      </div>
    </div>
  );
}
