'use client';

import { Lock, Gauge, Target, ScanSearch, Zap, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/section';
import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/common/Reveal';

/**
 * TechnologySection — On-Device AI explainer: three pillar cards, a simple
 * Edge-Computing flow diagram, and key engineering metrics.
 */
export function TechnologySection() {
  const t = useTranslations('LandingPage');

  const cards = [
    { icon: Lock, titleKey: 'techCard1Title', bodyKey: 'techCard1Body' },
    { icon: Gauge, titleKey: 'techCard2Title', bodyKey: 'techCard2Body' },
    { icon: Target, titleKey: 'techCard3Title', bodyKey: 'techCard3Body' },
  ] as const;

  return (
    <Section id="teknologi" tone="grid">
      <Reveal className="mx-auto mb-14 max-w-2xl text-center">
        <Pill variant="navy" className="mb-4">
          {t('techKicker')}
        </Pill>
        <h2 className="text-heading text-3xl text-navy md:text-4xl">{t('techTitle')}</h2>
        <p className="mt-4 text-base text-muted-foreground">{t('techSubtitle')}</p>
      </Reveal>

      {/* Flow diagram */}
      <Reveal className="mb-12">
        <div className="flex flex-col items-stretch gap-2.5 rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-6 md:flex-row md:items-center md:gap-2">
          <FlowNode icon={ScanSearch} label="DOM + URL" sub="title · heading · anchor" />
          <Arrow />
          <FlowNode icon={Zap} label="Hybrid Analysis" sub="Rule-Based + LogReg" accent />
          <Arrow />
          <FlowNode icon={Target} label="Skor ≥ 0.72" sub="klasifikasi lokal" />
          <Arrow />
          <FlowNode icon={Lock} label="Blok + Interrupt" sub="on-device" accent />
        </div>
      </Reveal>

      {/* Pillar cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map(({ icon: Icon, titleKey, bodyKey }) => (
          <Reveal key={titleKey}>
            <div className="h-full rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy/10">
                <Icon className="h-5 w-5 text-navy" />
              </div>
              <h3 className="text-title mt-5 text-lg text-navy">{t(titleKey)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(bodyKey)}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Metrics */}
      <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {[
          { value: t('techMetric1Value'), label: t('techMetric1Label') },
          { value: t('techMetric2Value'), label: t('techMetric2Label') },
          { value: t('techMetric3Value'), label: t('techMetric3Label') },
          { value: t('techMetric4Value'), label: t('techMetric4Label') },
        ].map((m) => (
          <div key={m.label} className="bg-card p-6 text-center">
            <p className="text-2xl font-extrabold tracking-tight text-crimson md:text-3xl">
              {m.value}
            </p>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function FlowNode({
  icon: Icon,
  label,
  sub,
  accent = false,
}: {
  icon: typeof Lock;
  label: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-1 items-center gap-3 rounded-2xl bg-muted/60 p-4">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          accent ? 'bg-crimson text-white' : 'bg-navy text-white'
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-navy">{label}</p>
        <p className="text-[11px] leading-snug text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-navy/30 md:rotate-0" aria-hidden />
  );
}
