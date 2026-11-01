import { getLocale, getTranslations } from 'next-intl/server';
import { ButtonLink } from '@/components/ui/button';
import { ArrowIcon } from '@/components/ui/icons';
import { site } from '@/lib/config/site';
import { getPathname } from '@/lib/i18n/navigation';
import { localePath, navHref, routes } from '@/lib/i18n/paths';
import { socialIconPaths } from '@/lib/config/social-icons';
import { routing } from '@/lib/i18n/routing';
import { navSections } from '@/lib/config/navigation';
import { BrandLogo } from './brand-logo';
import { HeaderFrame } from './header-frame';
import { SiteMenu } from './site-menu';

export async function SiteHeader() {
  const [locale, t, tNav] = await Promise.all([getLocale(), getTranslations('common'), getTranslations('navigation')]);
  const otherLocale = routing.locales.find((l) => l !== locale) ?? routing.defaultLocale;

  return (
    <HeaderFrame>
      <div className="container-site">
        {/* Floating glass bar; firmer once the page scrolls or the menu is open. */}
        <div className="flex h-14 items-center justify-between gap-4 rounded-full bg-ink/45 ps-4 pe-2 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08),0_18px_40px_-24px_rgb(0_0_0/0.9)] backdrop-blur-[14px] transition-[background-color,box-shadow] duration-400 ease-brand group-data-scrolled/header:bg-ink/75 group-data-scrolled/header:shadow-[inset_0_0_0_1px_var(--color-line-strong),0_24px_50px_-24px_rgb(0_0_0/0.95)] group-has-[[aria-expanded=true]]/header:bg-ink/85 sm:h-[60px] sm:ps-7 sm:pe-3 lg:ps-9 lg:pe-4">
          <a href={getPathname({ href: '/', locale })} aria-label={tNav('homeAria')} className="inline-flex">
            <BrandLogo />
          </a>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={getPathname({ href: '/', locale: otherLocale })}
              hrefLang={otherLocale}
              lang={otherLocale}
              aria-label={tNav('switchLocaleAria')}
              className="grid size-11 place-items-center font-display text-sm font-bold transition-[color,scale] duration-300 ease-brand hover:text-aqua active:scale-[0.94]"
            >
              {tNav('switchLocaleShort')}
            </a>
            <ButtonLink href={localePath(locale, routes.contact)} size="sm" className="max-sm:hidden">
              {t('startProject')}
              <ArrowIcon />
            </ButtonLink>
            <SiteMenu
              items={navSections.map((section) => ({
                href: navHref(locale, section),
                label: tNav(`items.${section.key}`),
              }))}
              socials={site.socials.map((social) => ({
                href: social.href,
                label: t(`socials.${social.key}`),
                icon: socialIconPaths[social.key],
              }))}
              labels={{
                open: t('menu'),
                close: t('close'),
                nav: tNav('mainAria'),
                followUs: t('followUs'),
                note: tNav('menuNote'),
                ctaTitle: tNav('menuCtaTitle'),
                cta: t('startProject'),
              }}
              email={site.email}
              contactHref={localePath(locale, routes.contact)}
            />
          </div>
        </div>
      </div>
    </HeaderFrame>
  );
}
