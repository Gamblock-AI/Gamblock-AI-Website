import type { MoodLevel, UrgeLevel } from '@/lib/recovery/types';

export interface WeeklyPatternDay {
  date: string;
  shortLabel: string;
  fullLabel: string;
  mood: MoodLevel | null;
  urge: UrgeLevel | null;
}

interface WeeklyPatternChartProps {
  days: WeeklyPatternDay[];
  moodLabel: string;
  urgeLabel: string;
  ariaLabel: string;
}

function barHeight(value: MoodLevel | UrgeLevel): string {
  return `${value * 17}%`;
}

export function WeeklyPatternChart({
  days,
  moodLabel,
  urgeLabel,
  ariaLabel,
}: WeeklyPatternChartProps) {
  return (
    <figure>
      <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-navy" />
          {moodLabel}
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-sage" />
          {urgeLabel}
        </span>
      </div>

      <div
        role="img"
        aria-label={ariaLabel}
        className="grid grid-cols-7 gap-1.5 sm:gap-3"
      >
        {days.map((day) => (
          <div key={day.date} className="min-w-0 text-center">
            <div className="relative flex h-36 items-end justify-center gap-1 overflow-hidden rounded-xl border border-border/80 bg-muted/45 px-1.5 pt-5 pb-2 sm:gap-1.5 sm:px-2">
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-1/5 border-t border-dashed border-border/65"
              />
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-2/5 border-t border-dashed border-border/65"
              />
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-3/5 border-t border-dashed border-border/65"
              />
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-4/5 border-t border-dashed border-border/65"
              />

              {day.mood === null ? (
                <span
                  aria-hidden="true"
                  className="relative z-10 mb-1 h-0.5 w-2 rounded-full bg-navy/25 sm:w-3"
                />
              ) : (
                <span
                  aria-hidden="true"
                  title={`${day.fullLabel}: ${moodLabel} ${day.mood}/5`}
                  className="relative z-10 w-2 rounded-full bg-navy sm:w-3"
                  style={{ height: barHeight(day.mood) }}
                >
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold tabular-nums text-navy sm:text-[10px]">
                    {day.mood}
                  </span>
                </span>
              )}

              {day.urge === null ? (
                <span
                  aria-hidden="true"
                  className="relative z-10 mb-1 h-0.5 w-2 rounded-full bg-sage/25 sm:w-3"
                />
              ) : (
                <span
                  aria-hidden="true"
                  title={`${day.fullLabel}: ${urgeLabel} ${day.urge}/5`}
                  className="relative z-10 w-2 rounded-full bg-sage sm:w-3"
                  style={{ height: barHeight(day.urge) }}
                >
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold tabular-nums text-sage sm:text-[10px]">
                    {day.urge}
                  </span>
                </span>
              )}
            </div>
            <span className="mt-2 block truncate text-[11px] font-semibold text-muted-foreground sm:text-xs">
              {day.shortLabel}
            </span>
          </div>
        ))}
      </div>

      <ul className="sr-only">
        {days.map((day) => (
          <li key={day.date}>
            {day.fullLabel}: {moodLabel} {day.mood ?? '-'}, {urgeLabel}{' '}
            {day.urge ?? '-'}.
          </li>
        ))}
      </ul>
    </figure>
  );
}
