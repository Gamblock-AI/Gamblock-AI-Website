'use client';

import { ArrowRight, BarChart3, LockKeyhole } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';
import { Skeleton } from '@/components/ui/skeleton';
import { useProgressSnapshot } from '@/hooks/use-progress-snapshot';

function lastSevenDays() {
  const end = new Date();
  end.setHours(12, 0, 0, 0);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(end);
    date.setDate(end.getDate() - (6 - index));
    return date;
  });
}

export function WeeklySnapshot() {
  const t = useTranslations('recoveryDashboard');
  const locale = useLocale();
  const { data, loading } = useProgressSnapshot(7);

  const days = useMemo(() => lastSevenDays(), []);
  const blocks = data?.daily_blocks ?? [];
  const max = Math.max(1, ...blocks);
  const total = blocks.reduce((sum, count) => sum + count, 0);
  const hasData = blocks.some((count) => count > 0);
  const dayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });

  return (
    <section
      className="border-border bg-card shadow-soft flex h-full flex-col justify-between rounded-2xl border p-4 sm:p-5"
      aria-labelledby="weekly-snapshot-title"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between shrink-0">
        <div>
          <h2
            id="weekly-snapshot-title"
            className="text-navy text-lg font-bold"
          >
            {t('blockTrendTitle')}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            {t('blockTrendBody')}
          </p>
          <p className="text-muted-foreground mt-1 flex items-start gap-2 text-sm leading-6">
            <LockKeyhole className="mt-1 size-3.5 shrink-0" aria-hidden="true" />
            {t('blockTrendPrivate')}
          </p>
        </div>
        <Link
          href={ROUTES.RECOVERY}
          className="text-navy hover:bg-navy/[0.05] focus-visible:ring-navy/30 inline-flex min-h-11 items-center gap-2 self-start rounded-xl px-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-2"
        >
          {t('blockTrendOpen')}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-4 flex-1">
        {loading ? (
          <div className="space-y-3" role="status">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-4 w-40" />
            <span className="sr-only">{t('blockTrendLoading')}</span>
          </div>
        ) : hasData ? (
          <div className="border-border bg-muted/45 flex h-full flex-col rounded-2xl border p-3 sm:p-4">
            <div
              className="flex h-40 flex-1 items-end justify-between gap-1.5 sm:gap-3"
              role="img"
              aria-label={t('blockTrendAria', { total })}
            >
              {days.map((date, index) => {
                const count = blocks[index] ?? 0;
                const height = count > 0 ? Math.max(8, (count / max) * 100) : 0;
                return (
                  <div
                    key={date.toISOString()}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                  >
                    <span className="text-navy text-xs font-bold tabular-nums">
                      {count > 0 ? count : ''}
                    </span>
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className={`w-full rounded-t-md ${
                          count > 0 ? 'bg-navy' : 'bg-border'
                        }`}
                        style={{
                          height: count > 0 ? `${height}%` : '2px',
                          minHeight: count > 0 ? '0.5rem' : undefined,
                        }}
                      />
                    </div>
                    <span className="text-muted-foreground text-[10px] font-medium">
                      {dayFormatter.format(date)}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-muted-foreground mt-3 flex items-center gap-1.5 text-xs font-semibold">
              <BarChart3 className="size-3.5" aria-hidden="true" />
              {t('blockTrendTotal', { count: total })}
            </p>
          </div>
        ) : (
          <div className="border-border bg-muted/30 flex h-full min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-4 text-center">
            <BarChart3 className="text-navy-light size-6" aria-hidden="true" />
            <p className="text-muted-foreground max-w-xs text-sm leading-6">
              {t('blockTrendNoData')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
