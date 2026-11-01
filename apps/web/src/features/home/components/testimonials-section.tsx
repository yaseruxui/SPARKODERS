import { getLocale, getTranslations } from 'next-intl/server';
import { getTestimonials } from '@/lib/content';
import { resolveLocale } from '@/lib/i18n/resolve-locale';
import { TestimonialsOrbit } from './testimonials-orbit';
import { Kashida } from '@/components/ui/kashida';

export async function TestimonialsSection() {
  const locale = resolveLocale(await getLocale());
  const [t, items] = await Promise.all([getTranslations('home.testimonials'), getTestimonials(locale)]);
  const quotes = items.map((item) => ({
    ...item,
    // The card draws its own quote mark, so drop the typographic quotes around the text.
    quote: item.quote.replace(/^[«“"]\s*|\s*[»”"]$/g, ''),
    alt: t('photoAlt', { name: item.name }),
  }));

  return (
    <section
      aria-labelledby="testimonials-title"
      className="relative overflow-hidden py-[clamp(80px,12vw,160px)] bg-[radial-gradient(40%_50%_at_50%_55%,rgb(110_41_172/0.22),transparent_70%)]"
    >
      <div className="container-site">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="testimonials-title" className="display-xl">
            <Kashida text={t('title')} />
          </h2>
          <p className="mt-5 text-lg text-muted">{t('lead')}</p>
        </div>
        <TestimonialsOrbit quotes={quotes} chooseLabel={t('choose')} />
      </div>
    </section>
  );
}
