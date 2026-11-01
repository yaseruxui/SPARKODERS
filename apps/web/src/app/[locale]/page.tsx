import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactSection } from '@/features/contact/components/contact-section';
import { BlogSection } from '@/features/home/components/blog-section';
import { DelightSection } from '@/features/home/components/delight-section';
import { HeroSection } from '@/features/home/components/hero-section';
import { LeadsSection } from '@/features/home/components/leads-section';
import { ScrubIntro } from '@/features/home/components/scrub-intro';
import { ServicesSection } from '@/features/home/components/services-section';
import { TeamSection } from '@/features/home/components/team-section';
import { TestimonialsSection } from '@/features/home/components/testimonials-section';
import { WorkSection } from '@/features/home/components/work-section';
import { resolveLocale } from '@/lib/i18n/resolve-locale';

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations('home.intro');

  return (
    <>
      <HeroSection />
      <ScrubIntro
        ariaLabel={t('aria')}
        paragraphs={[t('p1'), t('p2'), t('p3'), t('p4')]}
        scrollHint={t('scrollHint')}
        cta={{ label: t('cta'), href: '#contact' }}
      />
      <WorkSection />
      <LeadsSection />
      <DelightSection />
      <TeamSection />
      <ServicesSection />
      <TestimonialsSection />
      <BlogSection />
      <ContactSection />
    </>
  );
}
