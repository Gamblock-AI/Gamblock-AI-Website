import {
  RECOVERY_STORAGE_VERSION,
  type IntentionFocusPeriod,
  type IntentionHistoryEvent,
  type IntentionHistoryEventType,
  type RecoveryState,
} from './types';

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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLocalWeekStartString(date = new Date()): string {
  const weekStart = new Date(date);
  const day = weekStart.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  weekStart.setDate(weekStart.getDate() - daysSinceMonday);
  return getLocalDateString(weekStart);
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
