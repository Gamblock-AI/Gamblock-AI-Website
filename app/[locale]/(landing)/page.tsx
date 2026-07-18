import { MarketingNav } from '@/components/landing/MarketingNav';
import { FixedBackground } from '@/components/landing/FixedBackground';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { HeroSection } from '@/components/landing/sections/HeroSection';
import { SupportersStrip } from '@/components/landing/sections/SupportersStrip';
import { CrisisSection } from '@/components/landing/sections/CrisisSection';
import { FeaturesSection } from '@/components/landing/sections/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/sections/HowItWorksSection';
import { TechnologySection } from '@/components/landing/sections/TechnologySection';
import { PsychoeducationSection } from '@/components/landing/sections/PsychoeducationSection';
import { PlatformSection } from '@/components/landing/sections/PlatformSection';
import { TeamSection } from '@/components/landing/sections/TeamSection';
import { FaqSection } from '@/components/landing/sections/FaqSection';
import { FinalCtaSection } from '@/components/landing/sections/FinalCtaSection';
import { getTranslations } from 'next-intl/server';

export default async function LandingPage() {
  const t = await getTranslations('LandingPage');

  return (
    <div className="relative text-foreground">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-full bg-navy px-5 py-3 text-sm font-bold text-white shadow-card transition-transform focus:translate-y-0"
      >
        {t('skipLink')}
      </a>
      <FixedBackground />
      <MarketingNav />
      <main id="main-content">
        <HeroSection />
        <SupportersStrip />
        <CrisisSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TechnologySection />
        <PsychoeducationSection />
        <PlatformSection />
        <TeamSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
