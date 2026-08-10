import type { DailyCheckIn } from '@/lib/recovery/types';
import type { WeeklyPatternDay } from '../weekly-pattern-chart';

export const MINIMUM_WEEKLY_CHECK_INS = 3;

export interface WeeklyInsights {
  days: WeeklyPatternDay[];
  recordedDays: WeeklyPatternDay[];
  latestCheckIn: DailyCheckIn | null;
  moodRange: number;
  strongerUrgeCount: number;
}

export function getWeeklyInsights(
  checkIns: DailyCheckIn[],
  locale: string
): WeeklyInsights {
  const checkInsByDate = new Map<string, DailyCheckIn>();
  for (const checkIn of checkIns) {
    if (!checkInsByDate.has(checkIn.date)) {
      checkInsByDate.set(checkIn.date, checkIn);
    }
  }

  const days = getLastSevenDays(checkInsByDate, locale);
  const recordedDays = days.filter((day) => day.mood !== null);
  const moods = recordedDays.flatMap((day) =>
    day.mood === null ? [] : [day.mood]
  );
  const moodRange =
    moods.length > 0 ? Math.max(...moods) - Math.min(...moods) : 0;
  const strongerUrgeCount = recordedDays.filter(
    (day) => day.urge !== null && day.urge >= 4
  ).length;
  const latestCheckIn = findLatestCheckIn(recordedDays, checkInsByDate);

  return {
    days,
    recordedDays,
    latestCheckIn,
    moodRange,
    strongerUrgeCount,
  };
}

function getLastSevenDays(
  checkInsByDate: ReadonlyMap<string, DailyCheckIn>,
  locale: string
): WeeklyPatternDay[] {
  const shortFormatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const fullFormatter = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const dateKey = getLocalDateKey(date);
    const checkIn = checkInsByDate.get(dateKey);

    return {
      date: dateKey,
      shortLabel: shortFormatter.format(date),
      fullLabel: fullFormatter.format(date),
      mood: checkIn?.mood ?? null,
      urge: checkIn?.urge ?? null,
    };
  });
}

function findLatestCheckIn(
  recordedDays: WeeklyPatternDay[],
  checkInsByDate: ReadonlyMap<string, DailyCheckIn>
): DailyCheckIn | null {
  const latestDay = recordedDays.at(-1);
  return latestDay ? (checkInsByDate.get(latestDay.date) ?? null) : null;
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
