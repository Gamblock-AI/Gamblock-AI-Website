import type { ProgressSnapshot } from '@/hooks/use-progress-snapshot';

export type RangeDays = 7 | 30 | 90;
export type ActivityDay = ProgressSnapshot['activity_days'][number];

export const progressCategories = [
  'check_ins',
  'practices',
  'journals',
  'missions',
  'education',
  'reviews',
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

export function categoryTone(key: ProgressCategory) {
  return {
    check_ins: 'bg-sage',
    practices: 'bg-cyan',
    journals: 'bg-amber',
    missions: 'bg-navy',
    education: 'bg-[#7757c8]',
    reviews: 'bg-[#dc7b63]',
  }[key];
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
