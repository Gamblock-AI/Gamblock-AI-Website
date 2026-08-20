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
    <div className="relative flex-1 flex flex-col justify-center rounded-2xl border border-border/80 bg-muted/20 p-2 sm:p-3 overflow-hidden shadow-2xs min-h-[190px]">
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
              className={totalBlocked > 0 ? 'text-border' : 'text-border/40'}
              strokeDasharray="4 6"
            />
          );
        })}

        {totalBlocked > 0 && points.length > 1 ? (
          <path
            d={`M ${areaPoints}`}
            fill={`url(#${gradientId})`}
            stroke="none"
          />
        ) : null}

        {totalBlocked > 0 && points.length > 1 ? (
          <polyline
            points={linePoints}
            fill="none"
            stroke="currentColor"
            className="text-navy"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <line
            x1={LEFT}
            x2={RIGHT}
            y1={BOTTOM}
            y2={BOTTOM}
            stroke="currentColor"
            className="text-border/60"
            strokeWidth="1.5"
          />
        )}

        {points.map((point, index) => (
          <g key={point.date}>
            {totalBlocked > 0 ? (
              <>
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
              </>
            ) : (
              <circle
                cx={xFor(index)}
                cy={BOTTOM}
                r="2"
                fill="currentColor"
                className="text-border/50"
              />
            )}
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
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center -translate-y-4 gap-1.5">
          <ShieldCheck className="size-7.5 text-muted-foreground/45" aria-hidden="true" />
          <span className="text-muted-foreground/60 text-[0.6875rem] font-medium tracking-tight">
            {t('dailyTrendEmptyTitle')}
          </span>
        </div>
      ) : null}
    </div>
  );
}
