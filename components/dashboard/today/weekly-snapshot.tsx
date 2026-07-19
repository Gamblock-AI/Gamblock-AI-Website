import { ArrowRight, BarChart3, LockKeyhole, Sparkles } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { moodCopy } from '@/components/dashboard/today/dashboard-copy';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';
import type { DailyCheckIn, MoodLevel } from '@/lib/recovery/types';
import { RECOVERY_TIME_ZONE } from '@/lib/recovery/date';
import { getRecentJakartaCheckInDays } from '@/lib/recovery/weekly-window';

interface WeeklySnapshotProps {
  checkIns: DailyCheckIn[];
}

interface ChartPoint {
  dateKey: string;
  x: number;
  y: number;
  label: string;
  mood: MoodLevel;
}

const CHART_LEFT = 112;
const CHART_RIGHT = 612;
const CHART_TOP = 40;
const CHART_BOTTOM = 176;
const MOOD_GUIDE_LEVELS = [5, 3, 1] as const;

export function WeeklySnapshot({ checkIns }: WeeklySnapshotProps) {
  const t = useTranslations('recoveryDashboard');
  const locale = useLocale();
  const days = getRecentJakartaCheckInDays(checkIns);
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    timeZone: RECOVERY_TIME_ZONE,
  });
  const points = days.flatMap<ChartPoint>((day, index) => {
    if (!day.checkIn) return [];
    const mood = day.checkIn.mood;
    return [
      {
        dateKey: day.dateKey,
        x: CHART_LEFT + index * ((CHART_RIGHT - CHART_LEFT) / 6),
        y: CHART_BOTTOM - (mood - 1) * ((CHART_BOTTOM - CHART_TOP) / 4),
        label: dateFormatter.format(day.date),
        mood,
      },
    ];
  });
  const moods = points.map((point) => point.mood);
  const moodRange =
    moods.length > 0 ? Math.max(...moods) - Math.min(...moods) : 0;
  const strongerUrgeCount = days.filter(
    (day) => (day.checkIn?.urge ?? 0) >= 4
  ).length;
  const enoughData = points.length >= 4;
  const needMore = Math.max(0, 4 - points.length);
  const patternSummary =
    moodRange <= 1 ? t('weeklyStable') : t('weeklyChanged');
  const chartSummary = enoughData
    ? [
        t('weeklyRecorded', { count: points.length }),
        patternSummary,
        strongerUrgeCount > 0
          ? t('weeklyStrongerUrge', { count: strongerUrgeCount })
          : null,
      ]
        .filter(Boolean)
        .join(' ')
    : `${t('weeklyInsufficient')} ${t('weeklyNeedMore', { count: needMore })}`;

  return (
    <section
      className="border-border bg-card shadow-soft h-full rounded-2xl border p-5"
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

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-stretch">
        <div className="border-border bg-muted/45 rounded-2xl border p-2 sm:p-3">
          <p className="sr-only">{chartSummary}</p>
          <svg
            viewBox="0 0 640 220"
            className="h-auto min-h-48 w-full"
            aria-hidden="true"
          >
            {[1, 2, 3, 4, 5].map((mood) => {
              const y =
                CHART_BOTTOM - (mood - 1) * ((CHART_BOTTOM - CHART_TOP) / 4);
              return (
                <line
                  key={mood}
                  x1={CHART_LEFT}
                  x2={CHART_RIGHT}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  className="text-border"
                  strokeDasharray="4 7"
                />
              );
            })}
            {MOOD_GUIDE_LEVELS.map((mood) => {
              const y =
                CHART_BOTTOM - (mood - 1) * ((CHART_BOTTOM - CHART_TOP) / 4);
              return (
                <text
                  key={mood}
                  x="6"
                  y={y + 4}
                  className="fill-muted-foreground text-[11px] font-semibold"
                >
                  {t(moodCopy[mood])}
                </text>
              );
            })}
            {points.length > 1 ? (
              <polyline
                points={points
                  .map((point) => `${point.x},${point.y}`)
                  .join(' ')}
                fill="none"
                stroke="currentColor"
                className="text-navy"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
            {points.map((point) => (
              <g key={point.dateKey}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="7"
                  fill="currentColor"
                  className="text-card"
                  stroke="currentColor"
                  strokeWidth="6"
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="currentColor"
                  className="text-sky"
                />
              </g>
            ))}
            {days.map((day, index) => (
              <text
                key={day.dateKey}
                x={CHART_LEFT + index * ((CHART_RIGHT - CHART_LEFT) / 6)}
                y="207"
                textAnchor="middle"
                className="fill-muted-foreground text-[10px] font-medium"
              >
                {dateFormatter.format(day.date)}
              </text>
            ))}
          </svg>
          <ul className="sr-only">
            {days.map((day) => (
              <li key={day.dateKey}>
                {day.checkIn
                  ? t('weeklyDayRecorded', {
                      date: dateFormatter.format(day.date),
                      mood: t(moodCopy[day.checkIn.mood]),
                    })
                  : t('weeklyDayMissing', {
                      date: dateFormatter.format(day.date),
                    })}
              </li>
            ))}
          </ul>
        </div>
        {enoughData ? (
          <div className="border-navy/10 bg-azure/45 rounded-2xl border p-4">
            <span className="bg-navy text-sky flex size-10 items-center justify-center rounded-xl">
              <Sparkles className="size-[1.125rem]" aria-hidden="true" />
            </span>
            <h3 className="text-navy mt-4 text-sm font-bold">
              {t('weeklyInsightTitle')}
            </h3>
            <p className="text-foreground mt-2 text-sm leading-6">
              {t('weeklyRecorded', { count: points.length })}
            </p>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              {patternSummary}
            </p>
            {strongerUrgeCount > 0 ? (
              <p className="text-muted-foreground mt-1 text-sm leading-6">
                {t('weeklyStrongerUrge', { count: strongerUrgeCount })}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="border-border bg-muted/30 flex flex-col justify-center rounded-2xl border border-dashed p-4">
            <span className="bg-navy flex size-10 items-center justify-center rounded-xl text-white shadow-sm">
              <BarChart3 className="size-[1.125rem]" aria-hidden="true" />
            </span>
            <h3 className="text-foreground mt-4 text-sm font-semibold">
              {t('weeklyInsufficient')}
            </h3>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              {t('weeklyNeedMore', { count: needMore })}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
