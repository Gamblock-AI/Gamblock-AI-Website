'use client';

import Image from 'next/image';
import { ArrowRight, Check, Monitor, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/routes';

const METRICS = [
  ['techMetric1Value', 'techMetric1Label'],
  ['techMetric2Value', 'techMetric2Label'],
  ['techMetric3Value', 'techMetric3Label'],
  ['techMetric4Value', 'techMetric4Label'],
] as const;

export function TechnologySection() {
  const t = useTranslations('LandingPage');

  return (
    <section id="teknologi" className="relative isolate overflow-hidden bg-[#0b1730] px-4 py-24 text-white sm:px-6 md:px-10 md:py-32">
      <div className="pointer-events-none absolute -left-32 top-24 size-[30rem] rounded-full border border-white/10" aria-hidden="true" />
      <div className="pointer-events-none absolute right-0 top-0 size-[34rem] rounded-full bg-[#123e7b]/55 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-[82rem]">
        <div className="grid items-end gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-label text-sky">05 / {t('techKicker')}</p>
            <h2 className="marketing-display mt-4 max-w-2xl text-4xl md:text-6xl">{t('techTitle')}</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/65">{t('techSubtitle')}</p>
          </div>
          <div className="relative overflow-hidden rounded-[2rem] border border-sky/25 bg-[#10295a]">
            <Image src="/images/landing/generated-v3/gami-devices.webp" alt={t('techImageAlt')} width={1672} height={941} sizes="(max-width: 1024px) 100vw, 54vw" className="aspect-[16/9] w-full object-cover" />
            <span className="absolute bottom-5 left-5 rounded-full bg-[#c8102e] px-4 py-2 text-[0.65rem] font-extrabold tracking-[0.12em] text-white uppercase">{t('trustOnDevice')}</span>
          </div>
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-3">
          <article className="relative overflow-hidden rounded-[1.7rem] bg-sky p-6 text-navy lg:col-span-1">
            <div className="pointer-events-none absolute -right-14 -top-14 size-44 rounded-full border-[1.1rem] border-navy/12" aria-hidden="true" />
            <div className="pointer-events-none absolute right-10 top-10 size-3 rounded-full bg-white/45" aria-hidden="true" />
            <div className="relative z-10 pt-[4.25rem]">
              <p className="text-label text-navy/55">{t('localProcessingLabel')}</p>
              <h3 className="mt-2 text-xl font-extrabold">{t('techCard1Title')}</h3>
              <p className="mt-3 text-sm leading-6 text-navy/70">{t('techCard1Body')}</p>
            </div>
          </article>
          <article className="relative overflow-hidden rounded-[1.7rem] border border-white/15 bg-white/[0.07] p-6 lg:col-span-1">
            <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full border-[1.1rem] border-sky/15" aria-hidden="true" />
            <div className="pointer-events-none absolute right-10 top-10 size-3 rounded-full bg-sky/50" aria-hidden="true" />
            <div className="relative z-10 pt-[4.25rem]">
              <p className="text-label text-white/45">{t('accountDataLabel')}</p>
              <h3 className="mt-2 text-xl font-extrabold">{t('techCard2Title')}</h3>
              <p className="mt-3 text-sm leading-6 text-white/65">{t('techCard2Body')}</p>
            </div>
          </article>
          <article className="relative overflow-hidden rounded-[1.7rem] border border-white/15 bg-[#c8102e] p-6 lg:col-span-1">
            <div className="pointer-events-none absolute -right-14 -top-14 size-44 rounded-full border-[1.1rem] border-white/15" aria-hidden="true" />
            <div className="pointer-events-none absolute right-10 top-10 size-3 rounded-full bg-white/45" aria-hidden="true" />
            <div className="relative z-10 pt-[4.25rem]">
              <p className="text-label text-white/55">{t('trustHybrid')}</p>
              <h3 className="mt-2 text-xl font-extrabold">{t('techCard3Title')}</h3>
              <p className="mt-3 text-sm leading-6 text-white/75">{t('techCard3Body')}</p>
            </div>
          </article>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map(([value, label], index) => (
            <article key={label} className={`rounded-2xl p-5 ${index === 3 ? 'bg-white text-navy' : 'border border-white/10 bg-white/[0.05] text-white'}`}>
              <p className={`text-2xl font-extrabold tracking-tight ${index === 0 ? 'text-sky' : index === 3 ? 'text-[#c8102e]' : ''}`}>{t(value)}</p>
              <p className={`mt-2 text-xs leading-5 ${index === 3 ? 'text-navy/60' : 'text-white/60'}`}>{t(label)}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 grid items-center gap-6 rounded-[2rem] border border-white/15 bg-white/[0.06] p-6 sm:p-8 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-label text-sky">06 / {t('platformKicker')}</p>
            <h3 className="mt-3 text-2xl font-extrabold">{t('platformTitle')}</h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">{t('platformBody')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-navy"><Smartphone className="size-4" />{t('platformAndroid')}</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-white"><Monitor className="size-4" />{t('platformWindows')}</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-sky/30 bg-sky/10 px-4 py-2 text-sm font-bold text-sky"><Check className="size-4" />{t('platformOffline')}</span>
            <Button render={<Link href={ROUTES.PLATFORMS} />} variant="primary" size="default" className="rounded-full bg-[#c8102e] text-white hover:bg-[#da1c3a] focus-visible:ring-white"><ArrowRight className="size-4" />{t('linkDownload')}</Button>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-20 bg-white [clip-path:ellipse(72%_100%_at_50%_100%)]" aria-hidden="true" />
    </section>
  );
}
