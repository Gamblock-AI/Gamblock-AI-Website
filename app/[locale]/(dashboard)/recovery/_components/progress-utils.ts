import type { ProgressSnapshot } from '@/hooks/use-progress-snapshot';

export type RangeDays = 7 | 30 | 90;
export type ActivityDay = ProgressSnapshot['activity_days'][number];

export const progressCategories = [
  'check_ins',
  'journals',
  'missions',
  'education',
  'reviews',
  'learning_hub',
  'protection',
] as const;

export type ProgressCategory = (typeof progressCategories)[number];

export function buildCalendarDays(range: RangeDays) {
  const end = new Date();
  end.setHours(12, 0, 0, 0);
  return Array.from({ length: range }, (_, index) => {
    const date = new Date(end);
    date.setDate(end.getDate() - (range - 1 - index));
    return date;
  });
}

export function isoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function activityCategories(activity?: ActivityDay) {
  return progressCategories.filter((key) => (activity?.[key] ?? 0) > 0);
}

export function activityTotal(activity?: ActivityDay) {
  return activityCategories(activity).reduce(
    (total, key) => total + (activity?.[key] ?? 0),
    0
  );
}

/** Icon color per category (used on calendar cells and day detail). */
export function categoryIconTone(key: ProgressCategory) {
  return {
    check_ins: 'text-navy',
    journals: 'text-navy-light',
    missions: 'text-sky',
    education: 'text-cyan-dark',
    reviews: 'text-sage-dark',
    learning_hub: 'text-sage',
    protection: 'text-amber',
  }[key];
}

/** Background and border tone per category for tags and pills. */
export function categoryBgTone(key: ProgressCategory) {
  return {
    check_ins: 'bg-navy/10 text-navy border-navy/20',
    journals: 'bg-navy-light/10 text-navy-light border-navy-light/20',
    missions: 'bg-sky/15 text-sky-800 border-sky/30',
    education: 'bg-cyan/15 text-cyan-800 border-cyan/30',
    reviews: 'bg-sage-dark/10 text-sage-dark border-sage-dark/20',
    learning_hub: 'bg-sage/15 text-sage-800 border-sage/30',
    protection: 'bg-amber/15 text-amber-800 border-amber/30',
  }[key];
}

export function formatWeekday(
  date: Date,
  locale: string,
  format: 'short' | 'long' | 'narrow' = 'short'
) {
  return new Intl.DateTimeFormat(locale, { weekday: format }).format(date);
}

export function formatMonthShort(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
  }).format(date);
}

export function formatDayMonth(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

export function progressCsv(snapshot: ProgressSnapshot) {
  const rows = [
    ['date', ...progressCategories],
    ...snapshot.activity_days.map((day) => [
      day.date,
      ...progressCategories.map((category) => String(day[category])),
    ]),
  ];

  return rows
    .map((row) =>
      row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')
    )
    .join('\n');
}

export function downloadText(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
