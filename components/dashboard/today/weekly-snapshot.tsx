import { ArrowRight, BarChart3, LockKeyhole } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';
import type { DailyCheckIn } from '@/lib/recovery/types';

interface WeeklySnapshotProps {
  checkIns: DailyCheckIn[];
}

interface ChartPoint {
  x: number;
  y: number;
  label: string;
  mood: number;
}

function startOfLocalDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function WeeklySnapshot({ checkIns }: WeeklySnapshotProps) {
  const t = useTranslations('recoveryDashboard');
  const locale = useLocale();
  const today = startOfLocalDay(new Date());
  const firstDay = new Date(today);
  firstDay.setDate(today.getDate() - 6);

  const recent = checkIns
    .map((checkIn) => ({
      checkIn,
      date: startOfLocalDay(new Date(`${checkIn.date}T00:00:00`)),
    }))
    .filter(({ date }) => date >= firstDay && date <= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
  });
  const dayMs = 24 * 60 * 60 * 1000;
  const points: ChartPoint[] = recent.map(({ checkIn, date }) => {
    const dayIndex = Math.round((date.getTime() - firstDay.getTime()) / dayMs);
    return {
      x: 36 + dayIndex * 74,
      y: 108 - (checkIn.mood - 1) * 21,
      label: dateFormatter.format(date),
      mood: checkIn.mood,
    };
  });
  const enoughData = points.length >= 4;
  const needMore = Math.max(0, 4 - points.length);

  return (
    <section
      className="rounded-3xl border border-border bg-card p-5 shadow-soft"
      aria-labelledby="weekly-snapshot-title"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id="weekly-snapshot-title"
            className="text-navy text-lg font-bold"
          >
            {t('weeklyTitle')}
          </h2>
          <p className="text-muted-foreground mt-1 flex items-start gap-2 text-sm leading-6">
            <LockKeyhole
              className="mt-1 size-3.5 shrink-0"
              aria-hidden="true"
            />
            {t('weeklyPrivate')}
          </p>
        </div>
        {enoughData ? (
          <Link
            href={ROUTES.PROGRESS}
            className="text-navy hover:bg-navy/[0.05] focus-visible:ring-navy/30 inline-flex min-h-11 items-center gap-2 self-start rounded-xl px-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-2"
          >
            {t('weeklyOpen')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      {!enoughData ? (
        <div className="mt-4 flex flex-col items-start gap-3 rounded-xl border border-dashed border-border bg-muted/35 p-4 sm:flex-row sm:items-center">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy text-white shadow-sm">
            <BarChart3 className="size-[1.125rem]" aria-hidden="true" />
          </span>
          <div>
            <p className="text-foreground text-sm font-semibold">
              {t('weeklyInsufficient')}
            </p>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              {t('weeklyNeedMore', { count: needMore })}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
          <div className="overflow-x-auto rounded-2xl border border-border bg-muted/55 px-2 py-3">
            <svg
              viewBox="0 0 520 140"
              className="h-36 w-full min-w-[500px]"
              role="img"
              aria-label={t('weeklyAccessibleSummary')}
            >
              <title>{t('weeklyAccessibleSummary')}</title>
              {[24, 45, 66, 87, 108].map((y) => (
                <line
                  key={y}
                  x1="28"
                  x2="502"
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  className="text-border"
                  strokeDasharray="3 5"
                />
              ))}
              <polyline
                points={points
                  .map((point) => `${point.x},${point.y}`)
                  .join(' ')}
                fill="none"
                stroke="currentColor"
                className="text-navy"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {points.map((point) => (
                <g key={`${point.label}-${point.x}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="5"
                    fill="currentColor"
                    className="text-navy"
                  />
                  <text
                    x={point.x}
                    y="132"
                    textAnchor="middle"
                    className="fill-muted-foreground text-[10px]"
                  >
                    {point.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          <div className="rounded-xl border border-border bg-muted/35 p-4">
            <p className="text-navy text-sm leading-6 font-semibold">
              {t('weeklyRecorded', { count: points.length })}
            </p>
            <Link
              href={ROUTES.PROGRESS}
              className="text-navy focus-visible:ring-navy/30 mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-semibold outline-none hover:underline focus-visible:ring-2"
            >
              {t('weeklyOpen')}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
