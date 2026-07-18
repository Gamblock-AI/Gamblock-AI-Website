import {
  RECOVERY_STORAGE_VERSION,
  type IntentionFocusPeriod,
  type IntentionHistoryEvent,
  type IntentionHistoryEventType,
  type RecoveryState,
} from './types';

export const RECOVERY_TIME_ZONE = 'Asia/Jakarta' as const;

const jakartaDateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: RECOVERY_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function createEmptyRecoveryState(): RecoveryState {
  return {
    version: RECOVERY_STORAGE_VERSION,
    intentions: [],
    intentionHistory: [],
    checkIns: [],
    selectedMissions: [],
    weeklyReviews: [],
  };
}

export function getLocalDateString(date = new Date()): string {
  const { year, month, day } = getJakartaDateParts(date);
  return `${year}-${month}-${day}`;
}

export function getLocalWeekStartString(date = new Date()): string {
  const { year, month, day } = getJakartaDateParts(date);
  const weekStart = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day)),
  );
  const weekDay = weekStart.getUTCDay();
  const daysSinceMonday = weekDay === 0 ? 6 : weekDay - 1;
  weekStart.setUTCDate(weekStart.getUTCDate() - daysSinceMonday);

  return [
    weekStart.getUTCFullYear(),
    String(weekStart.getUTCMonth() + 1).padStart(2, '0'),
    String(weekStart.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

function getJakartaDateParts(date: Date) {
  const parts = jakartaDateFormatter.formatToParts(date);
  const values = new Map(parts.map((part) => [part.type, part.value]));

  return {
    year: values.get('year') ?? '1970',
    month: values.get('month') ?? '01',
    day: values.get('day') ?? '01',
  };
}

export function createHistoryEvent(
  intentionId: string,
  type: IntentionHistoryEventType,
  occurredAt: string
): IntentionHistoryEvent {
  return {
    id: createId('int_event'),
    intentionId,
    type,
    occurredAt,
  };
}

export function createId(prefix: string): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return `${prefix}_${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export function focusPeriodFromDays(days: number): IntentionFocusPeriod {
  if (!Number.isFinite(days) || days > 14) return 'one_month';
  if (days <= 1) return 'today';
  if (days <= 7) return 'this_week';
  return 'two_weeks';
}
