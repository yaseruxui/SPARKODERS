import { getTranslations } from 'next-intl/server';
import { siWhatsapp } from 'simple-icons';
import { site } from '@/lib/config/site';

/**
 * Floating WhatsApp shortcut, fixed to the bottom end corner of every page. It is a plain link to
 * wa.me with a prefilled greeting, so no third-party script is loaded. The menu overlay covers it.
 */
export async function WhatsAppButton() {
  const t = await getTranslations('common.whatsapp');
  const href = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(t('message'))}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={t('label')}
      className="group/wa fixed end-4 bottom-4 z-30 flex items-center gap-3 sm:end-6 sm:bottom-6"
    >
      <span className="pointer-events-none rounded-full bg-ink/85 px-4 py-2 text-sm font-semibold opacity-0 shadow-[inset_0_0_0_1px_var(--color-line-strong)] backdrop-blur-md transition-[opacity,translate] duration-300 ease-brand max-sm:hidden translate-x-2 group-hover/wa:translate-x-0 group-hover/wa:opacity-100 group-focus-visible/wa:translate-x-0 group-focus-visible/wa:opacity-100 rtl:-translate-x-2">
        {t('label')}
      </span>
      <span className="relative grid size-14 place-items-center rounded-full bg-[#25d366] text-white shadow-[0_14px_30px_-10px_rgb(37_211_102/0.7)] transition-[scale] duration-300 ease-brand group-hover/wa:scale-110 group-active/wa:scale-95">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-[#25d366] opacity-40 motion-safe:animate-ping [animation-duration:2.4s]"
        />
        <svg viewBox="0 0 24 24" aria-hidden="true" className="relative size-7" fill="currentColor">
          <path d={siWhatsapp.path} />
        </svg>
      </span>
    </a>
  );
}
