'use client';

import Link from 'next/link';
import { ArrowRight, TrendingUp, Users, UserX, ShieldX, Zap, Activity, HeartHandshake } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/section';
import { Pill } from '@/components/ui/pill';
import { StatCounter } from '@/components/ui/stat-counter';
import { GradientBlob } from '@/components/ui/gradient-blob';
import { Reveal } from '@/components/common/Reveal';
import { MarketingNav } from '@/components/landing/MarketingNav';
import { FixedBackground } from '@/components/landing/FixedBackground';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { ROUTES } from '@/routes';

export function DampakContent() {
  const t = useTranslations('DampakContent');

  const crisis = [
    { icon: TrendingUp, value: 286.84, prefix: 'Rp', suffix: ' T', decimals: 2, label: t('crisis1'), src: 'PPATK, 2026' },
    { icon: Users, value: 12.3, prefix: '', suffix: ' Jt', decimals: 1, label: t('crisis2'), src: 'PPATK, 2026' },
    { icon: ShieldX, value: 5.5, prefix: '', suffix: ' Jt+', decimals: 1, label: t('crisis3'), src: 'Kemkomdigi, 2025' },
  ];

  const demographics = [
    { value: 440, suffix: ' Rb', label: t('demo1Label'), note: t('demo1Note') },
    { value: 520, suffix: ' Rb', label: t('demo2Label'), note: t('demo2Note') },
  ];

  const arc = [
    { n: '01', icon: UserX, title: t('arc1Title'), desc: t('arc1Body') },
    { n: '02', icon: Zap, title: t('arc2Title'), desc: t('arc2Body') },
    { n: '03', icon: Activity, title: t('arc3Title'), desc: t('arc3Body') },
    { n: '04', icon: HeartHandshake, title: t('arc4Title'), desc: t('arc4Body') },
  ];

  return (
    <div className="relative text-foreground">
      <FixedBackground />
      <MarketingNav />

      {/* HERO */}
      <section className="relative overflow-hidden px-6 pt-32 pb-20 md:px-10 md:pt-40 md:pb-24">
        <GradientBlob className="left-[-4rem] top-28 h-72 w-72" color="bg-azure" />
        <div className="relative mx-auto max-w-4xl text-center">
          <Reveal>
            <Pill variant="accent" className="mb-5">{t('heroKicker')}</Pill>
            <h1 className="text-display text-4xl text-navy md:text-6xl">
              {t('heroTitle')} <span className="text-crimson">{t('heroTitleAccent')}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {t('heroBody')}
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {crisis.map(({ icon: Icon, value, prefix, suffix, decimals, label, src }) => (
              <Reveal key={label}>
                <div className="h-full rounded-3xl border border-border bg-card p-6 text-left shadow-soft">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-crimson/10">
                    <Icon className="h-5 w-5 text-crimson" />
                  </div>
                  <p className="mt-5 text-3xl font-extrabold tracking-tight text-navy md:text-4xl">
                    <StatCounter value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
                  </p>
                  <p className="mt-2 text-sm leading-snug text-muted-foreground">{label}</p>
                  <p className="text-label mt-3 text-navy/40">{src}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DEMOGRAPHICS */}
      <Section tone="pastel">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <Reveal>
            <h2 className="text-heading text-3xl text-navy md:text-4xl">{t('demoTitle')}</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">{t('demoBody')}</p>
            <p className="text-label mt-4 text-navy/40">PPATK, 2025</p>
          </Reveal>
          <div className="grid gap-4">
            {demographics.map(({ value, suffix, label, note }) => (
              <Reveal key={label}>
                <div className="flex items-end justify-between rounded-3xl border border-border bg-card p-6 shadow-soft">
                  <div>
                    <p className="text-3xl font-extrabold tracking-tight text-navy md:text-4xl">
                      <StatCounter value={value} suffix={suffix} />
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                  </div>
                  <p className="max-w-[10rem] text-right text-xs leading-snug text-navy/40">{note}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* WHY BLOCKING ALONE FAILS */}
      <Section tone="dots">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Pill variant="navy" className="mb-4">{t('whyKicker')}</Pill>
          <h2 className="text-heading text-3xl text-navy md:text-4xl">{t('whyTitle')}</h2>
          <p className="mt-4 text-base text-muted-foreground">{t('whyBody')}</p>
        </Reveal>
      </Section>

      {/* RECOVERY ARC */}
      <Section tone="navy">
        <Reveal className="mb-12 max-w-2xl">
          <Pill variant="ghost" className="mb-4 bg-white/10 text-white">{t('arcKicker')}</Pill>
          <h2 className="text-heading text-3xl text-white md:text-4xl">{t('arcTitle')}</h2>
        </Reveal>
        <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
          {arc.map(({ n, icon: Icon, title, desc }, i) => (
            <Reveal
              key={n}
              delay={i * 0.07}
              className="relative flex-1 rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur"
            >
              <span className="font-mono text-xs tracking-widest text-white/30">{n}</span>
              <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-crimson text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-white">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-white/65">{desc}</p>
              {i < arc.length - 1 && (
                <ArrowRight className="absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-white/20 md:block" />
              )}
            </Reveal>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="relative overflow-hidden px-6 py-24 md:px-10">
        <GradientBlob className="left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2" color="bg-sky-light" />
        <Reveal className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-display text-3xl text-navy md:text-5xl">
            {t('ctaTitle')} <span className="text-crimson">{t('ctaTitleAccent')}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">{t('ctaBody')}</p>
          <Link href={ROUTES.REGISTER} className="mt-8 inline-block">
            <Button variant="accent" size="lg" className="rounded-full px-8">
              {t('ctaButton')}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
