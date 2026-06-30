'use client';

import { TrendingUp, Users, UserX, ShieldX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/section';
import { Pill } from '@/components/ui/pill';
import { StatCounter } from '@/components/ui/stat-counter';
import { Reveal } from '@/components/common/Reveal';

const STATS = [
  {
    icon: TrendingUp,
    value: 286.84,
    prefix: 'Rp',
    suffix: ' T',
    decimals: 2,
    labelKey: 'crisisStat1Label',
    sourceKey: 'crisisStat1Source',
  },
  {
    icon: Users,
    value: 12.3,
    prefix: '',
    suffix: ' Jt',
    decimals: 1,
    labelKey: 'crisisStat2Label',
    sourceKey: 'crisisStat2Source',
  },
  {
    icon: UserX,
    value: 960,
    prefix: '',
    suffix: ' Rb',
    decimals: 0,
    labelKey: 'crisisStat3Label',
    sourceKey: 'crisisStat3Source',
  },
  {
    icon: ShieldX,
    value: 5.5,
    prefix: '',
    suffix: ' Jt+',
    decimals: 1,
    labelKey: 'crisisStat4Label',
    sourceKey: 'crisisStat4Source',
  },
] as const;

/**
 * CrisisSection — data-driven proof of the problem with animated count-up
 * stats (PPATK / Kemkomdigi). Numbers count up on scroll into view.
 */
export function CrisisSection() {
  const t = useTranslations('LandingPage');

  return (
    <Section id="dampak" tone="dots">
      <Reveal className="mx-auto max-w-3xl text-center">
        <Pill variant="accent" className="mb-4">
          {t('crisisKicker')}
        </Pill>
        <h2 className="text-display text-4xl text-navy md:text-5xl">{t('crisisTitle')}</h2>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground">
          {t('crisisSubtitle')}
        </p>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ icon: Icon, value, prefix, suffix, decimals, labelKey, sourceKey }) => (
          <Reveal key={labelKey}>
            <div className="h-full rounded-3xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-card">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-crimson/10">
                <Icon className="h-5 w-5 text-crimson" />
              </div>
              <p className="mt-5 text-3xl font-extrabold tracking-tight text-navy md:text-4xl">
                <StatCounter
                  value={value}
                  prefix={prefix}
                  suffix={suffix}
                  decimals={decimals}
                />
              </p>
              <p className="mt-2 text-sm leading-snug text-muted-foreground">{t(labelKey)}</p>
              <p className="text-label mt-3 text-navy/40">{t(sourceKey)}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
