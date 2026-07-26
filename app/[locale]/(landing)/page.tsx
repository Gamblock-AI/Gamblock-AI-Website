import { MarketingNav } from '@/components/landing/MarketingNav';
import { SkipLink } from '@/components/landing/SkipLink';
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

export default function LandingPage() {
  return (
    <div className="relative text-foreground">
      <SkipLink />
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
