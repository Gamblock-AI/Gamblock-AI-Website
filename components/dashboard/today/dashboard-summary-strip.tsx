import { Activity, CalendarCheck2, Flame, ShieldAlert } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCounter } from '@/components/ui/stat-counter';
import type { DashboardSummary } from '@/hooks/use-dashboard-summary';
import { getRecentJakartaCheckInDays } from '@/lib/recovery/weekly-window';
import type { DailyCheckIn } from '@/lib/recovery/types';
import { cn } from '@/lib/utils';

interface DashboardSummaryStripProps {
  summary: DashboardSummary | null;
  summaryLoading: boolean;
  checkIns: DailyCheckIn[];
}

export function DashboardSummaryStrip({
  summary,
  summaryLoading,
  checkIns,
}: DashboardSummaryStripProps) {
  const t = useTranslations('recoveryDashboard');
  const locale = useLocale();
  const recentDays = getRecentJakartaCheckInDays(checkIns);
  const recordedDays = recentDays.filter((day) => day.checkIn);
  const metrics = [
    {
      key: 'check-ins',
      icon: CalendarCheck2,
      label: t('summaryCheckIns'),
      value: t('summaryCheckInsValue', { count: recordedDays.length }),
      detail: t('summaryCheckInsBody'),
      featured: true,
    },
    {
      key: 'protection-last',
      icon: ShieldAlert,
      label: t('summaryProtectionLast'),
      value: summaryLoading ? null : summary ? (
        <StatCounter value={summary.blocked_attempts} locale={locale} />
      ) : (
        t('summaryUnavailableValue')
      ),
      detail: summary
        ? t('summaryProtectionLastBody')
        : t('summaryUnavailable'),
    },
    {
      key: 'active-days',
      icon: Activity,
      label: t('summaryActiveDays'),
      value: summaryLoading ? null : summary ? (
        <StatCounter value={summary.active_days} locale={locale} />
      ) : (
        t('summaryUnavailableValue')
      ),
      detail: summary ? t('summaryActiveDaysBody') : t('summaryUnavailable'),
    },
    {
      key: 'streak',
      icon: Flame,
      label: t('summaryStreak'),
      value: summaryLoading ? null : summary ? (
        <StatCounter value={summary.current_streak} locale={locale} />
      ) : (
        t('summaryUnavailableValue')
      ),
      detail: summary ? t('summaryStreakBody') : t('summaryUnavailable'),
    },
  ];

  return (
    <section
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      aria-label={t('summaryLabel')}
    >
      {metrics.map(({ key, icon: Icon, label, value, detail, featured }) => (
        <div
          key={key}
          className={cn(
            'shadow-soft flex flex-col rounded-2xl border p-4',
            featured
              ? 'border-navy bg-navy text-white'
              : 'border-border bg-card text-foreground'
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <p
              className={cn(
                'text-sm font-semibold',
                featured ? 'text-white/80' : 'text-muted-foreground'
              )}
            >
              {label}
            </p>
            <span
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-xl',
                featured ? 'text-sky bg-white/12' : 'bg-azure/65 text-navy'
              )}
            >
              <Icon className="size-[1.125rem]" aria-hidden="true" />
            </span>
          </div>
          {value === null ? (
            <Skeleton
              className={cn(
                'mt-2 h-7 w-24',
                featured ? 'bg-white/20' : 'bg-muted'
              )}
            />
          ) : (
            <p
              className={cn(
                'mt-2 text-2xl font-extrabold tracking-tight tabular-nums',
                featured ? 'text-white' : 'text-navy'
              )}
            >
              {value}
            </p>
          )}
          <p
            className={cn(
              'mt-1 text-xs leading-5',
              featured ? 'text-white/70' : 'text-muted-foreground'
            )}
          >
            {detail}
          </p>
        </div>
      ))}
    </section>
  );
}
