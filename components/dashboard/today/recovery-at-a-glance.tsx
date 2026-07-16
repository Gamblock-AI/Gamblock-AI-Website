'use client';

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarCheck2,
  HeartHandshake,
  ShieldCheck,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { DashboardSummary } from '@/hooks/use-dashboard-summary';
import type { DailyCheckIn } from '@/lib/recovery/types';
import { ROUTES } from '@/routes';

interface RecoveryAtAGlanceProps {
  summary: DashboardSummary | null;
  checkIns: DailyCheckIn[];
}

const destinations = [
  {
    href: ROUTES.PROGRESS,
    titleKey: 'glanceProgressTitle',
    bodyKey: 'glanceProgressBody',
    icon: BarChart3,
  },
  {
    href: ROUTES.EDUCATION,
    titleKey: 'glanceLearnTitle',
    bodyKey: 'glanceLearnBody',
    icon: BookOpen,
  },
  {
    href: ROUTES.RECOVERY,
    titleKey: 'glanceRecoveryTitle',
    bodyKey: 'glanceRecoveryBody',
    icon: HeartHandshake,
  },
] as const;

export function RecoveryAtAGlance({
  summary,
  checkIns,
}: RecoveryAtAGlanceProps) {
  const t = useTranslations('recoveryDashboard');
  const synced = summary?.data_state === 'synced';

  return (
    <section aria-labelledby="recovery-glance-title">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sage text-xs font-bold tracking-[0.12em] uppercase">
            {t('glanceEyebrow')}
          </p>
          <h2
            id="recovery-glance-title"
            className="text-navy mt-1 text-xl font-bold"
          >
            {t('glanceTitle')}
          </h2>
        </div>
        <p className="text-muted-foreground flex items-center gap-2 text-xs font-semibold">
          <ShieldCheck className="text-sage size-4" aria-hidden="true" />
          {synced ? t('glanceSynced') : t('glanceLocal')}
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <span className="flex size-10 items-center justify-center rounded-xl bg-navy text-white shadow-sm">
            <CalendarCheck2 className="size-[1.125rem]" aria-hidden="true" />
          </span>
          <p className="mt-4 text-2xl font-extrabold text-navy tabular-nums">
            {summary?.active_days ?? 0}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {t('glanceActiveDays')}
          </p>
        </div>

        {destinations.map(({ href, titleKey, bodyKey, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border border-border bg-card p-4 shadow-soft outline-none transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-px hover:border-navy/35 hover:shadow-card focus-visible:ring-2 focus-visible:ring-navy/35 motion-reduce:transform-none motion-reduce:transition-none"
          >
            <span className="flex items-start justify-between gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-navy text-white shadow-sm transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none">
                <Icon className="size-[1.125rem]" aria-hidden="true" />
              </span>
              <ArrowRight
                className="text-navy/55 size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none"
                aria-hidden="true"
              />
            </span>
            <span className="text-navy mt-4 block text-sm font-bold">
              {t(titleKey)}
            </span>
            <span className="mt-1 block text-sm leading-6 text-muted-foreground">
              {titleKey === 'glanceProgressTitle'
                ? t(bodyKey, { count: checkIns.length })
                : t(bodyKey)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
