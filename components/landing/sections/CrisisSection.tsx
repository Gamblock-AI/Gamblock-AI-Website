'use client';

import Image from 'next/image';
import { ArrowUpRight, CircleAlert, UsersRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Section } from '@/components/ui/section';
import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/common/Reveal';
import { StatCounter } from '@/components/ui/stat-counter';

const STATS = [
  {
    value: 286.84,
    prefix: 'Rp',
    suffix: ' T',
    decimals: 2,
    labelKey: 'crisisStat1Label',
    sourceKey: 'crisisStat1Source',
  },
  {
    value: 12.3,
    prefix: '',
    suffix: ' juta',
    decimals: 1,
    labelKey: 'crisisStat2Label',
    sourceKey: 'crisisStat2Source',
  },
  {
    value: 960,
    prefix: '',
    suffix: ' ribu',
    decimals: 0,
    labelKey: 'crisisStat3Label',
    sourceKey: 'crisisStat3Source',
  },
] as const;

export function CrisisSection() {
  const t = useTranslations('LandingPage');

  return (
    <Section id="dampak" tone="white" className="py-20 md:py-28">
      <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-navy shadow-[0_28px_70px_rgba(22,41,76,0.18)]">
            <Image
              src="/images/landing/generated/impact-student.webp"
              alt="Mahasiswa Indonesia belajar di meja dengan suasana tenang"
              width={1448}
              height={1086}
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/95 via-navy/45 to-transparent p-6 pt-20 text-white">
              <p className="max-w-md text-sm leading-6 text-white/85">{t('crisisSubtitle')}</p>
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <Pill variant="accent" className="mb-4">
              <CircleAlert className="size-3.5" />
              {t('crisisKicker')}
            </Pill>
            <h2 className="max-w-3xl text-heading text-3xl text-navy md:text-5xl">
              {t('crisisTitle')}
            </h2>
          </Reveal>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {STATS.map((stat, index) => (
              <Reveal key={stat.labelKey} delay={0.05 + index * 0.05}>
                <article className="h-full rounded-2xl border border-navy/8 bg-white/82 p-5 shadow-soft backdrop-blur">
                  <p className="text-2xl font-extrabold tracking-tight text-navy">
                    <StatCounter
                      value={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      decimals={stat.decimals}
                    />
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {t(stat.labelKey)}
                  </p>
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-navy/40">
                    {t(stat.sourceKey)}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <Link
              href="/dampak"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-navy transition-colors hover:text-crimson"
            >
              <UsersRound className="size-4" />
              {t('impactLink')}
              <ArrowUpRight className="size-4" />
            </Link>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
