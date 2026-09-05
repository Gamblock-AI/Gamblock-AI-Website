'use client';

import Image from 'next/image';
import { ArrowUpRight, CircleAlert, UsersRound } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Section } from '@/components/ui/section';
import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/common/Reveal';
import { StatCounter } from '@/components/ui/stat-counter';
import { ROUTES } from '@/routes';

export function CrisisSection() {
  const t = useTranslations('LandingPage');
  const locale = useLocale();
  const formatLocale = locale === 'en' ? 'en-US' : 'id-ID';

  const stats = [
    {
      value: 286.84,
      prefix: 'Rp',
      suffix: t('crisisStat1Suffix'),
      decimals: 2,
      labelKey: 'crisisStat1Label',
      sourceKey: 'crisisStat1Source',
    },
    {
      value: 12.3,
      prefix: '',
      suffix: t('crisisStat2Suffix'),
      decimals: 1,
      labelKey: 'crisisStat2Label',
      sourceKey: 'crisisStat2Source',
    },
    {
      value: 960,
      prefix: '',
      suffix: t('crisisStat3Suffix'),
      decimals: 0,
      labelKey: 'crisisStat3Label',
      sourceKey: 'crisisStat3Source',
    },
  ];

  return (
    <Section id="dampak" tone="white" className="py-24 md:py-32">
      <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-navy shadow-card">
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
            <Pill variant="accent" className="mb-4 w-fit">
              <CircleAlert className="size-3.5" />
              {t('crisisKicker')}
            </Pill>
            <h2 className="max-w-3xl text-heading text-3xl text-navy md:text-5xl">
              {t('crisisTitle')}
            </h2>
          </Reveal>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <Reveal key={stat.labelKey} delay={0.05 + index * 0.05}>
                <article className="h-full rounded-3xl border border-border bg-card/90 p-5 shadow-soft backdrop-blur">
                  <p className="text-2xl font-extrabold tracking-tight text-navy">
                    <StatCounter
                      value={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      decimals={stat.decimals}
                      locale={formatLocale}
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
              href={ROUTES.DAMPAK}
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
