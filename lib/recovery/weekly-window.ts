import { getLocalDateString } from './date';
import type { DailyCheckIn } from './types';

export interface WeeklyCheckInDay {
  dateKey: string;
  date: Date;
  checkIn: DailyCheckIn | null;
}

export function getRecentJakartaCheckInDays(
  checkIns: DailyCheckIn[],
  dayCount = 7,
  now = new Date()
): WeeklyCheckInDay[] {
  const safeDayCount = Math.max(1, Math.floor(dayCount));
  const [year, month, day] = getLocalDateString(now).split('-').map(Number);
  const today = new Date(Date.UTC(year, month - 1, day));
  const latestByDate = new Map<string, DailyCheckIn>();

  for (const checkIn of checkIns) {
    const current = latestByDate.get(checkIn.date);
    if (!current || current.recordedAt < checkIn.recordedAt) {
      latestByDate.set(checkIn.date, checkIn);
    }
  }

  return Array.from({ length: safeDayCount }, (_, index) => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - (safeDayCount - 1 - index));
    const dateKey = [
      date.getUTCFullYear(),
      String(date.getUTCMonth() + 1).padStart(2, '0'),
      String(date.getUTCDate()).padStart(2, '0'),
    ].join('-');

    return {
      dateKey,
      date,
      checkIn: latestByDate.get(dateKey) ?? null,
    };
  });
}
