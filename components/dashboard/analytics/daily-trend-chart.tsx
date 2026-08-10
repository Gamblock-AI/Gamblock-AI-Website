import { useId } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { AnalyticsDay } from '@/hooks/use-analytics';

const WIDTH = 640;
const HEIGHT = 190;
const TOP = 18;
const BOTTOM = 148;
const LEFT = 14;
const RIGHT = 626;

export function DailyTrendChart({ points }: { points: AnalyticsDay[] }) {
  const t = useTranslations('analyticsDashboard');
  const locale = useLocale();
  const gradientId = useId();
  const plotWidth = RIGHT - LEFT;
  const max = Math.max(1, ...points.map((point) => point.blocked));
  const xFor = (index: number) =>
    points.length <= 1
      ? LEFT + plotWidth / 2
      : LEFT + (index * plotWidth) / (points.length - 1);
  const yFor = (value: number) =>
    BOTTOM - (value / max) * (BOTTOM - TOP);
  const linePoints = points
    .map((point, index) => `${xFor(index)},${yFor(point.blocked)}`)
    .join(' ');
  const areaPoints = `${LEFT},${BOTTOM} ${linePoints} ${RIGHT},${BOTTOM}`;
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  });
  const labelStep = Math.max(1, Math.ceil(points.length / 7));
  const totalBlocked = points.reduce((sum, point) => sum + point.blocked, 0);

  return (
    <div className="relative flex-1 flex flex-col justify-center rounded-2xl border border-border/80 bg-muted/30 p-2 sm:p-3 overflow-hidden shadow-2xs min-h-[190px]">
      <p className="sr-only">
        {t('trendSummary', { total: totalBlocked, days: points.length })}
      </p>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto min-h-36 max-h-48 aspect-[640/190]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" className="text-azure" stopOpacity="0.9" />
            <stop offset="100%" stopColor="currentColor" className="text-azure" stopOpacity="0" />
          </linearGradient>
        </defs>

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

        {points.length > 1 && totalBlocked > 0 ? (
          <path
            d={`M ${areaPoints}`}
            fill={`url(#${gradientId})`}
            stroke="none"
          />
        ) : null}
        {points.length > 1 ? (
          <polyline
            points={linePoints}
            fill="none"
            stroke="currentColor"
            className={totalBlocked > 0 ? 'text-navy' : 'text-border/80'}
            strokeWidth={totalBlocked > 0 ? '3' : '2'}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        {points.map((point, index) => (
          <g key={point.date}>
            <circle
              cx={xFor(index)}
              cy={yFor(point.blocked)}
              r="5"
              fill="currentColor"
              className="text-card"
              stroke="currentColor"
              strokeWidth="4"
            />
            <circle
              cx={xFor(index)}
              cy={yFor(point.blocked)}
              r="3"
              fill="currentColor"
              className={point.blocked > 0 ? 'text-sky' : 'text-border'}
            />
          </g>
        ))}
        {points.map((point, index) =>
          index % labelStep === 0 ? (
            <text
              key={point.date}
              x={xFor(index)}
              y="176"
              textAnchor="middle"
              className="fill-muted-foreground text-[10px] font-medium"
            >
              {dateFormatter.format(new Date(`${point.date}T00:00:00`))}
            </text>
          ) : null
        )}
      </svg>

      {totalBlocked === 0 ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-3">
          <div className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-card/92 px-4 py-2.5 shadow-2xs backdrop-blur-xs">
            <span className="flex size-7 items-center justify-center rounded-lg bg-sage/15 text-sage-dark">
              <ShieldCheck className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-navy text-xs font-bold leading-tight">
                {t('dailyTrendEmptyTitle')}
              </p>
              <p className="text-muted-foreground mt-0.5 text-[0.6875rem] leading-tight">
                {t('dailyTrendEmptyBody')}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
