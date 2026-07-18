'use client';

import Image from 'next/image';
import { Check, Cpu, Download, HeartHandshake } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/section';
import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/common/Reveal';

const STEPS = [
  { icon: Download, titleKey: 'howStep1Title', bodyKey: 'howStep1Body' },
  { icon: Cpu, titleKey: 'howStep2Title', bodyKey: 'howStep2Body' },
  { icon: HeartHandshake, titleKey: 'howStep3Title', bodyKey: 'howStep3Body' },
] as const;

export function HowItWorksSection() {
  const t = useTranslations('LandingPage');

  return (
    <Section id="cara-kerja" tone="white" className="py-20 md:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
        <Reveal className="relative mx-auto w-full max-w-[34rem]">
          <div className="bg-sky-light absolute inset-8 rounded-full blur-3xl" aria-hidden />
          <div className="border-navy/8 relative flex aspect-square items-center justify-center overflow-hidden rounded-[2.5rem] border bg-[radial-gradient(circle_at_50%_35%,#f9fdff,#d9f4ff)]">
            <Image
              src="/images/landing/generated/gami-shield-feature.webp"
              alt="Gami memegang perisai perlindungan digital"
              width={771}
              height={1295}
              sizes="(max-width: 1024px) 88vw, 44vw"
              className="h-[98%] w-auto object-contain drop-shadow-[0_24px_36px_rgba(22,41,76,0.20)]"
            />
          </div>
        </Reveal>

        <div>
          <Reveal>
            <Pill variant="navy" className="mb-4">
              {t('howKicker')}
            </Pill>
            <h2 className="text-heading text-navy max-w-2xl text-3xl md:text-5xl">
              {t('howTitle')}
            </h2>
          </Reveal>

          <ol className="mt-9 space-y-4">
            {STEPS.map(({ icon: Icon, titleKey, bodyKey }, index) => (
              <Reveal key={titleKey} delay={0.05 + index * 0.05}>
                <li className="border-navy/8 shadow-soft grid grid-cols-[3rem_1fr] gap-4 rounded-2xl border bg-white/80 p-5 backdrop-blur">
                  <span className="bg-navy flex h-12 w-12 items-center justify-center rounded-xl text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-crimson text-[11px] font-extrabold tracking-[0.16em] uppercase">
                        0{index + 1}
                      </span>
                      <Check className="text-sky h-3.5 w-3.5" />
                    </div>
                    <h3 className="text-navy mt-1 font-bold">{t(titleKey)}</h3>
                    <p className="text-muted-foreground mt-1.5 text-sm leading-6">{t(bodyKey)}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
