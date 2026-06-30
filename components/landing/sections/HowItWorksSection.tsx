'use client';

import { Download, Cpu, HeartHandshake } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/section';
import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/common/Reveal';

/**
 * HowItWorksSection — three connected steps from install to rehabilitation.
 */
export function HowItWorksSection() {
  const t = useTranslations('LandingPage');

  const steps = [
    { icon: Download, titleKey: 'howStep1Title', bodyKey: 'howStep1Body' },
    { icon: Cpu, titleKey: 'howStep2Title', bodyKey: 'howStep2Body' },
    { icon: HeartHandshake, titleKey: 'howStep3Title', bodyKey: 'howStep3Body' },
  ] as const;

  return (
    <Section id="cara-kerja" tone="navy">
      <Reveal className="mx-auto mb-14 max-w-3xl text-center">
        <Pill variant="ghost" className="mb-4 bg-white/10 text-white">
          {t('howKicker')}
        </Pill>
        <h2 className="text-heading text-3xl text-white md:text-4xl">{t('howTitle')}</h2>
      </Reveal>

      <div className="grid gap-6 md:grid-cols-3">
        {steps.map(({ icon: Icon, titleKey, bodyKey }, i) => (
          <Reveal key={titleKey} delay={i * 0.08}>
            <div className="relative h-full rounded-3xl border border-white/10 bg-white/[0.07] p-7 backdrop-blur transition-colors hover:bg-white/[0.11]">
              <span className="text-label absolute right-6 top-6 text-white/25">
                0{i + 1}
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-crimson text-white shadow-[0_8px_24px_-6px_rgba(200,16,46,0.6)]">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-title mt-5 text-xl text-white">{t(titleKey)}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">{t(bodyKey)}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
