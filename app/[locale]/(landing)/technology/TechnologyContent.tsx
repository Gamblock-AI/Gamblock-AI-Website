'use client';

import { Link } from '@/i18n/routing';
import {
  Shield,
  Scan,
  Brain,
  Cpu,
  Lock,
  Eye,
  ArrowRight,
  GitBranch,
  Gauge,
  Network,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/section';
import { Pill } from '@/components/ui/pill';
import { GradientBlob } from '@/components/ui/gradient-blob';
import { Reveal } from '@/components/common/Reveal';
import { MarketingNav } from '@/components/landing/MarketingNav';
import { FixedBackground } from '@/components/landing/FixedBackground';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { ROUTES } from '@/routes';

export function TechnologyContent() {
  const t = useTranslations('TechnologyContent');

  const pillars = [
    { icon: GitBranch, title: t('pillar1Title'), desc: t('pillar1Body') },
    { icon: Scan, title: t('pillar2Title'), desc: t('pillar2Body') },
    { icon: Cpu, title: t('pillar3Title'), desc: t('pillar3Body') },
    { icon: Lock, title: t('pillar4Title'), desc: t('pillar4Body') },
    { icon: Network, title: t('pillar5Title'), desc: t('pillar5Body') },
    { icon: Gauge, title: t('pillar6Title'), desc: t('pillar6Body') },
  ];

  const pipeline = [
    { n: '01', icon: Eye, title: t('pipe1Title'), desc: t('pipe1Body') },
    { n: '02', icon: Scan, title: t('pipe2Title'), desc: t('pipe2Body') },
    { n: '03', icon: Brain, title: t('pipe3Title'), desc: t('pipe3Body') },
    { n: '04', icon: GitBranch, title: t('pipe4Title'), desc: t('pipe4Body') },
    { n: '05', icon: Shield, title: t('pipe5Title'), desc: t('pipe5Body') },
  ];

  return (
    <div className="relative text-foreground">
      <FixedBackground />
      <MarketingNav />

      {/* HERO */}
      <section className="relative overflow-hidden px-6 pt-32 pb-20 md:px-10 md:pt-40 md:pb-24">
        <GradientBlob className="right-[-4rem] top-28 h-72 w-72" color="bg-sky-light" />
        <div className="relative mx-auto max-w-4xl text-center">
          <Reveal>
            <Pill variant="navy" className="mb-5">{t('heroKicker')}</Pill>
            <h1 className="text-display text-4xl text-navy md:text-6xl">
              {t('heroTitle')} <span className="text-crimson">{t('heroTitleAccent')}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {t('heroBody')}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href={ROUTES.REGISTER}>
                <Button variant="accent" size="lg" className="rounded-full">
                  {t('ctaPrimary')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dampak">
                <Button variant="outline" size="lg" className="rounded-full">
                  {t('ctaSecondary')}
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PIPELINE */}
      <Section tone="grid">
        <Reveal className="mb-12 max-w-2xl">
          <h2 className="text-heading text-3xl text-navy md:text-4xl">{t('pipelineTitle')}</h2>
          <p className="mt-3 text-muted-foreground">{t('pipelineSubtitle')}</p>
        </Reveal>
        <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
          {pipeline.map(({ n, icon: Icon, title, desc }, i) => (
            <Reveal
              key={n}
              delay={i * 0.06}
              className="relative flex-1 rounded-3xl border border-border bg-card p-6 shadow-soft"
            >
              <span className="font-mono text-xs tracking-widest text-navy/30">{n}</span>
              <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-crimson/10">
                <Icon className="h-5 w-5 text-crimson" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-navy">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
              {i < pipeline.length - 1 && (
                <ArrowRight className="absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-navy/20 md:block" />
              )}
            </Reveal>
          ))}
        </div>
      </Section>

      {/* PILLARS */}
      <Section tone="pastel">
        <Reveal className="mb-12 max-w-2xl">
          <Pill variant="accent" className="mb-4">{t('pillarsKicker')}</Pill>
          <h2 className="text-heading text-3xl text-navy md:text-4xl">{t('pillarsTitle')}</h2>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 0.05}>
              <div className="h-full rounded-3xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-card">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy/10">
                  <Icon className="h-5 w-5 text-navy" />
                </div>
                <h3 className="mt-4 font-bold text-navy">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section tone="navy" className="text-center">
        <Reveal className="mx-auto max-w-2xl">
          <h2 className="text-heading text-3xl text-white md:text-4xl">
            {t('finalTitle')} <span className="text-crimson-light">{t('finalTitleAccent')}</span>
          </h2>
          <p className="mt-4 text-white/70">{t('finalBody')}</p>
          <Link href={ROUTES.REGISTER} className="mt-8 inline-block">
            <Button variant="accent" size="lg" className="rounded-full">
              {t('ctaPrimary')}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </Reveal>
      </Section>

      <SiteFooter />
    </div>
  );
}
