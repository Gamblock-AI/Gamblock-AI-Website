'use client';

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
    <div className="border-border bg-muted/45 rounded-2xl border p-2 sm:p-3">
      <p className="sr-only">
        {t('hourlySummary', { total, peak: peakHours })}
      </p>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto min-h-40 w-full"
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
              className="text-border"
              strokeDasharray="4 7"
            />
          );
        })}
        {buckets.map((bucket) => {
          const isPeak = bucket.count > 0 && bucket.count === topCount;
          const height = Math.max(0, BOTTOM - yFor(bucket.count));
          return (
            <rect
              key={bucket.hour}
              x={LEFT + bucket.hour * slotWidth + (slotWidth - barWidth) / 2}
              y={yFor(bucket.count)}
              width={barWidth}
              height={height}
              rx={isPeak ? 3 : 2}
              fill="currentColor"
              className={
                isPeak
                  ? 'text-crimson'
                  : bucket.count > 0
                    ? 'text-cyan'
                    : 'text-border'
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
    </div>
  );
}
