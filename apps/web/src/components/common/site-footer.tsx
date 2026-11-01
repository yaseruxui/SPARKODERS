import { getLocale, getTranslations } from 'next-intl/server';
import { footerSections, navSections } from '@/lib/config/navigation';
import { site } from '@/lib/config/site';
import { localePath, navHref, routes } from '@/lib/i18n/paths';
import { resolveLocale } from '@/lib/i18n/resolve-locale';
import { BrandLogo } from './brand-logo';

export async function SiteFooter() {
  const [t, tNav, tHome, rawLocale] = await Promise.all([
    getTranslations('common'),
    getTranslations('navigation'),
    getTranslations('home.outro'),
    getLocale(),
  ]);
  const locale = resolveLocale(rawLocale);
  const hrefFor = (key: (typeof footerSections)[number]) => {
    const section = navSections.find((s) => s.key === key);
    return section ? navHref(locale, section) : localePath(locale, '/');
  };
  const year = new Date().getFullYear();

  return (
    <footer className="overflow-hidden border-t border-line bg-ink-2 pt-[clamp(56px,8vw,96px)] pb-8">
      <div className="container-site">
        <div className="grid grid-cols-2 gap-10 border-b border-line pb-10 lg:grid-cols-[2fr_1fr_1fr]">
          <div className="col-span-2 lg:col-span-1">
            <a href={localePath(locale, '/')} aria-label={site.wordmark} className="inline-flex">
              <BrandLogo size="lg" />
            </a>
            <p className="mt-5 max-w-[34rem] leading-relaxed text-muted">{tHome('note')}</p>
          </div>
          <nav aria-label={tNav('quickLinks')}>
            <p className="label-sm">{tNav('quickLinks')}</p>
            <ul className="mt-3.5 grid gap-1.5">
              {footerSections.map((key) => (
                <li key={key}>
                  <a href={hrefFor(key)} className="text-muted transition-colors duration-200 hover:text-aqua">
                    {tNav(`items.${key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label={tNav('socialAria')}>
            <p className="label-sm">{t('followUs')}</p>
            <ul className="mt-3.5 grid gap-1.5">
              {site.socials.slice(0, 3).map((social) => (
                <li key={social.key}>
                  <a
                    href={social.href}
                    rel="noopener"
                    className="text-muted transition-colors duration-200 hover:text-aqua"
                  >
                    {t(`socials.${social.key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex flex-wrap justify-between gap-3 pt-6 text-sm text-faint">
          <span>{t('rights', { year })}</span>
          <span className="flex flex-wrap gap-x-6 gap-y-2">
            <a href={localePath(locale, routes.privacy)} className="hover:text-text">
              {t('privacy')}
            </a>
            <a href="#" className="hover:text-text">
              {t('backToTop')} ↑
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
