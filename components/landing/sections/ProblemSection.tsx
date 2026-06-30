'use client';

import Image from 'next/image';
import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/section';
import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/common/Reveal';

/**
 * ProblemSection — frames why conventional DNS/blacklist blocking fails, with
 * Gami peeking from behind the copy card.
 */
export function ProblemSection() {
  const t = useTranslations('LandingPage');
  const points = ['problemPoint1', 'problemPoint2', 'problemPoint3'] as const;

  return (
    <Section tone="pastel">
      <div className="grid items-center gap-12 md:grid-cols-[1.2fr_0.8fr]">
        <Reveal>
          <Pill variant="accent" className="mb-4">
            <AlertTriangle className="h-3.5 w-3.5" />
            {t('problemKicker')}
          </Pill>
          <h2 className="text-heading text-3xl text-navy md:text-4xl">{t('problemTitle')}</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {t('problemBody')}
          </p>
          <ul className="mt-6 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-navy/80">
                <span className="mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-crimson/15">
                  <span className="h-1.5 w-1.5 rounded-full bg-crimson" />
                </span>
                {t(p)}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1} className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-full bg-sky-light/50 blur-2xl" aria-hidden />
            <Image
              src="/images/mascot/gami-peek.png"
              alt="Gami mengintip, mengingatkan keterbatasan pemblokiran konvensional"
              width={320}
              height={320}
              className="w-56 select-none drop-shadow-[0_24px_48px_rgba(22,41,76,0.22)] md:w-72 animate-float-slow"
            />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
