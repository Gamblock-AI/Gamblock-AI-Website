import { MarketingNav } from '@/components/landing/MarketingNav';
import { FixedBackground } from '@/components/landing/FixedBackground';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { HeroSection } from '@/components/landing/sections/HeroSection';
import { SupportersStrip } from '@/components/landing/sections/SupportersStrip';
import { CrisisSection } from '@/components/landing/sections/CrisisSection';
import { ProblemSection } from '@/components/landing/sections/ProblemSection';
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
      <FixedBackground />
      <MarketingNav />
      <main>
        <HeroSection />
        <SupportersStrip />
        <CrisisSection />
        <ProblemSection />
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
