import { Clock3 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { AnalyticsHour } from '@/hooks/use-analytics';

const WIDTH = 640;
const HEIGHT = 190;
const TOP = 20;
const BOTTOM = 148;
const LEFT = 14;
const RIGHT = 626;

export function PeakHoursChart({ hours }: { hours: AnalyticsHour[] }) {
  const t = useTranslations('analyticsDashboard');
  const buckets = Array.from({ length: 24 }, (_, hour) => {
    const slot = hours.find((item) => item.hour === hour);
    return { hour, count: slot?.count ?? 0 };
  });
  const max = Math.max(1, ...buckets.map((bucket) => bucket.count));
  const plotWidth = RIGHT - LEFT;
  const slotWidth = plotWidth / 24;
  const barWidth = Math.max(3, slotWidth - 4);
  const yFor = (value: number) =>
    BOTTOM - (value / max) * (BOTTOM - TOP);
  const topCount = max;
  const peakHourCounts = buckets.filter((bucket) => bucket.count === topCount);
  const peakHours =
    peakHourCounts.length === 1
      ? t('peakHourSingle', {
          hour: String(peakHourCounts[0].hour).padStart(2, '0'),
          count: topCount,
        })
      : t('peakHourMultiple', { count: topCount });
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);

  return (
    <div className="relative flex-1 flex flex-col justify-center rounded-2xl border border-border/80 bg-muted/20 p-2 sm:p-3 overflow-hidden shadow-2xs min-h-[190px]">
      <p className="sr-only">
        {t('hourlySummary', { total, peak: peakHours })}
      </p>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto min-h-36 max-h-48 aspect-[640/190]"
        aria-hidden="true"
      >
        {[0, 0.33, 0.66, 1].map((ratio) => {
          const y = TOP + ratio * (BOTTOM - TOP);
          return (
            <line
              key={ratio}
              x1={LEFT}
              x2={RIGHT}
              y1={y}
              y2={y}
              stroke="currentColor"
              className={total > 0 ? 'text-border' : 'text-border/40'}
              strokeDasharray="4 6"
            />
          );
        })}
        {buckets.map((bucket) => {
          const isPeak = total > 0 && bucket.count > 0 && bucket.count === topCount;
          const height =
            total > 0
              ? Math.max(0, BOTTOM - yFor(bucket.count))
              : 5;
          const yPos = total > 0 ? yFor(bucket.count) : BOTTOM - 5;
          return (
            <rect
              key={bucket.hour}
              x={LEFT + bucket.hour * slotWidth + (slotWidth - barWidth) / 2}
              y={yPos}
              width={barWidth}
              height={height}
              rx={isPeak ? 3 : 2}
              fill="currentColor"
              className={
                total > 0
                  ? isPeak
                    ? 'text-crimson'
                    : bucket.count > 0
                      ? 'text-cyan'
                      : 'text-border/60'
                  : 'text-border/40'
              }
            />
          );
        })}
        {buckets.map((bucket) =>
          bucket.hour % 3 === 0 ? (
            <text
              key={bucket.hour}
              x={LEFT + bucket.hour * slotWidth + slotWidth / 2}
              y="176"
              textAnchor="middle"
              className="fill-muted-foreground text-[9px] font-medium"
            >
              {String(bucket.hour).padStart(2, '0')}
            </text>
          ) : null
        )}
      </svg>

      {total === 0 ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center -translate-y-4 gap-1.5">
          <Clock3 className="size-7.5 text-muted-foreground/45" aria-hidden="true" />
          <span className="text-muted-foreground/60 text-[0.6875rem] font-medium tracking-tight">
            {t('peakHoursEmptyTitle')}
          </span>
        </div>
      ) : null}
    </div>
  );
}
