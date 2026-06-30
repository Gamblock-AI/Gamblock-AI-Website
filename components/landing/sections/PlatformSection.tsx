'use client';

import Image from 'next/image';
import { Smartphone, Monitor } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/section';
import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/common/Reveal';

/**
 * PlatformSection — multi-platform reach (Android + Windows, offline-capable)
 * with a laptop mockup.
 */
export function PlatformSection() {
  const t = useTranslations('LandingPage');

  const badges = [
    { icon: Smartphone, key: 'platformAndroid' },
    { icon: Monitor, key: 'platformWindows' },
  ] as const;

  return (
    <Section tone="aqua">
      <Reveal className="mx-auto mb-12 max-w-2xl text-center">
        <Pill variant="navy" className="mb-4">
          {t('platformKicker')}
        </Pill>
        <h2 className="text-heading text-3xl text-navy md:text-4xl">{t('platformTitle')}</h2>
        <p className="mt-4 text-base text-muted-foreground">{t('platformBody')}</p>
      </Reveal>

      <Reveal delay={0.08} className="flex flex-col items-center gap-8">
        <div className="relative w-full max-w-3xl">
          <div className="absolute inset-0 -z-10 rounded-[3rem] bg-azure blur-3xl" aria-hidden />
          <Image
            src="/images/laptop-mockup.webp"
            alt="Tampilan Gamblock-AI di laptop dan perangkat desktop"
            width={1200}
            height={760}
            className="w-full select-none drop-shadow-[0_30px_70px_rgba(22,41,76,0.22)]"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {badges.map(({ icon: Icon, key }) => (
            <span
              key={key}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-navy shadow-soft"
            >
              <Icon className="h-4 w-4 text-navy" />
              {t(key)}
            </span>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
