'use client';

import { ArrowUpRight, Check, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Reveal } from '@/components/common/Reveal';
import { ROUTES } from '@/routes';

/**
 * LandingSnapshotCard — the visual bridge between the video hero and the
 * content sections below it. The preview is intentionally static: it explains
 * the product model without introducing a landing-page API request.
 */
export function LandingSnapshotCard() {
  const t = useTranslations('LandingPage');

  return (
    <section
      aria-labelledby="landing-snapshot-title"
      className="relative z-10 -mt-14 px-4 pb-6 sm:-mt-20 sm:px-6 md:-mt-24 md:px-10"
    >
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-float lg:grid-cols-[1.08fr_0.92fr]">
        <Reveal className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-azure px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-navy">
              <ShieldCheck className="size-3.5 text-sky" aria-hidden="true" />
              {t('snapshotKicker')}
            </span>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-navy/65">
              <span className="size-2 rounded-full bg-sage" aria-hidden="true" />
              {t('snapshotStatus')}
            </span>
          </div>

          <h2
            id="landing-snapshot-title"
            className="text-heading mt-5 max-w-xl text-2xl text-navy sm:text-3xl"
          >
            {t('snapshotTitle')}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            {t('snapshotBody')}
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <SnapshotMetric
              icon={ShieldCheck}
              label={t('snapshotMetric1Label')}
              value={t('snapshotMetric1Value')}
            />
            <SnapshotMetric
              icon={LockKeyhole}
              label={t('snapshotMetric2Label')}
              value={t('snapshotMetric2Value')}
            />
            <SnapshotMetric
              icon={Check}
              label={t('snapshotMetric3Label')}
              value={t('snapshotMetric3Value')}
            />
          </div>

          <Link
            href={ROUTES.TECHNOLOGY}
            className="mt-7 inline-flex items-center gap-2 rounded-full text-sm font-extrabold text-navy transition-colors hover:text-sky focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky/60"
          >
            {t('snapshotLink')}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </Reveal>

        <div className="relative overflow-hidden bg-footer-navy p-6 text-white sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-sky/20 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 size-72 rounded-full bg-navy-light/40 blur-3xl" aria-hidden="true" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-label text-sky">{t('snapshotCardLabel')}</p>
              <p className="mt-2 text-sm font-semibold text-white/65">
                {t('snapshotCardBody')}
              </p>
            </div>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-sky">
              <LockKeyhole className="size-5" aria-hidden="true" />
            </span>
          </div>

          <div className="relative mt-8 rounded-[1.5rem] border border-white/15 bg-white/[0.07] p-5 backdrop-blur sm:p-6">
            <div className="flex items-center justify-between text-xs font-semibold text-white/60">
              <span>{t('snapshotProgressLabel')}</span>
              <span className="text-sky">{t('snapshotProgressValue')}</span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-sky to-sky-light" />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {['01', '02', '03'].map((step, index) => (
                <div key={step} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                  <span className="text-[10px] font-extrabold tracking-[0.15em] text-sky">
                    {step}
                  </span>
                  <span className="mt-2 block h-1.5 rounded-full bg-white/15">
                    <span
                      className={`block h-full rounded-full bg-sky ${index === 0 ? 'w-full' : index === 1 ? 'w-3/4' : 'w-1/2'}`}
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SnapshotMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-azure/45 p-3.5">
      <Icon className="size-4 text-navy" aria-hidden="true" />
      <p className="mt-3 text-[11px] font-bold leading-4 text-navy/70">{label}</p>
      <p className="mt-1 text-sm font-extrabold leading-5 text-navy">{value}</p>
    </div>
  );
}
