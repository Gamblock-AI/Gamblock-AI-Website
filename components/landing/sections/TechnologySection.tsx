'use client';

import { Database, EyeOff, LockKeyhole, Server, ShieldCheck, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/section';
import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/common/Reveal';

export function TechnologySection() {
  const t = useTranslations('LandingPage');

  return (
    <Section id="teknologi" tone="navy" className="overflow-hidden py-20 md:py-28">
      <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-sky/15 blur-3xl" aria-hidden />
      <div className="relative grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Reveal>
          <Pill variant="ghost" className="mb-4 bg-white/10 text-white">
            <LockKeyhole className="size-3.5" />
            {t('techKicker')}
          </Pill>
          <h2 className="max-w-xl text-heading text-3xl text-white md:text-5xl">
            {t('techTitle')}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/65">
            {t('techSubtitle')}
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border-sky/20 bg-sky/10 border p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center bg-sky text-navy rounded-xl">
                  <Smartphone className="size-5" />
                </span>
                <span className="rounded-full bg-sky/15 text-sky-light px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em]">
                  {t('localProcessingLabel')}
                </span>
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">{t('techCard1Title')}</h3>
              <p className="mt-3 text-sm leading-6 text-white/65">{t('techCard1Body')}</p>
              <ul className="mt-6 space-y-3 text-sm text-white/80">
                <PrivacyItem icon={EyeOff} text={t('f1Bullet1')} />
                <PrivacyItem icon={ShieldCheck} text={t('f1Bullet3')} />
              </ul>
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Server className="size-5" />
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">
                  {t('accountDataLabel')}
                </span>
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">{t('techCard2Title')}</h3>
              <p className="mt-3 text-sm leading-6 text-white/65">{t('techCard2Body')}</p>
              <ul className="mt-6 space-y-3 text-sm text-white/80">
                <PrivacyItem icon={Database} text={t('f3Bullet1')} />
                <PrivacyItem icon={LockKeyhole} text={t('f4Bullet2')} />
              </ul>
            </article>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function PrivacyItem({ icon: Icon, text }: { icon: typeof EyeOff; text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <Icon className="text-sky mt-0.5 size-4 shrink-0" />
      <span>{text}</span>
    </li>
  );
}
