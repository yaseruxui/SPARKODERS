import { getLocale, getTranslations } from 'next-intl/server';
import { localePath, routes } from '@/lib/i18n/paths';
import { resolveLocale } from '@/lib/i18n/resolve-locale';
import { site } from '@/lib/config/site';
import { ContactForm } from './contact-form';
import { Kashida } from '@/components/ui/kashida';
import { cn } from '@/utils/cn';

/** Contact block: the closing section of the home page, or the body of the contact page (`asPage`). */
export async function ContactSection({ asPage = false }: { asPage?: boolean }) {
  const [t, rawLocale] = await Promise.all([getTranslations('contact'), getLocale()]);
  const locale = resolveLocale(rawLocale);
  const Heading = asPage ? 'h1' : 'h2';

  return (
    <section
      id="contact"
      className={cn(
        'bg-[radial-gradient(50%_60%_at_0%_100%,rgb(110_41_172/0.3),transparent_70%)] bg-ink',
        asPage
          ? 'pt-[calc(var(--header-h)+clamp(40px,7vw,96px))] pb-[clamp(80px,12vw,160px)]'
          : 'border-t border-line py-[clamp(80px,12vw,160px)]',
      )}
    >
      <div className="container-site grid items-start gap-[clamp(40px,6vw,96px)] lg:grid-cols-[1fr_1.2fr]">
        <div>
          <Heading className="display-xl">
            {t('title')}
            <br />
            <span className="text-violet">
              <Kashida text={t('titleAccent')} />
            </span>
          </Heading>
          <p className="mt-5 text-muted">{t('lead')}</p>
          <ul className="mt-8 grid gap-3">
            <li className="flex items-baseline gap-4">
              <span className="min-w-16 text-sm text-faint">{t('emailLabel')}</span>
              <a href={`mailto:${site.email}`} dir="ltr" className="hover:text-aqua">
                {site.email}
              </a>
            </li>
            <li className="flex items-baseline gap-4">
              <span className="min-w-16 text-sm text-faint">{t('phoneLabel')}</span>
              <a href={`tel:${site.phone}`} dir="ltr" className="hover:text-aqua">
                {site.phoneDisplay}
              </a>
            </li>
          </ul>
        </div>
        <ContactForm privacyHref={localePath(locale, routes.privacy)} />
      </div>
    </section>
  );
}
