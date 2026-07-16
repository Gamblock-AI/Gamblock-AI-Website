import {
  DATE_PATTERN,
  focusPeriods,
  intentionEventTypes,
  intentionStatuses,
  skillIds,
  weeklyAdjustments,
  weeklyHelpfulActions,
  weeklyOutcomes,
} from './constants';
import { getLocalDateString } from './date';
import type {
  IntentionFocusPeriod,
  IntentionHistoryEventType,
  IntentionStatus,
  MissionNumber,
  MoodLevel,
  SkillId,
  UrgeLevel,
  WeeklyAdjustment,
  WeeklyHelpfulAction,
  WeeklyOutcome,
} from './types';

export function normalizeText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export function readId(value: unknown): string {
  return typeof value === 'string' ? value.slice(0, 120) : '';
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isDateString(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00`);
  return (
    !Number.isNaN(parsed.getTime()) && getLocalDateString(parsed) === value
  );
}

export function isTimestamp(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

export function isMoodLevel(value: unknown): value is MoodLevel {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

export function isUrgeLevel(value: unknown): value is UrgeLevel {
  return isMoodLevel(value);
}

export function isMissionNumber(value: unknown): value is MissionNumber {
  return isMoodLevel(value);
}

export function isIntentionStatus(value: unknown): value is IntentionStatus {
  return (
    typeof value === 'string' && intentionStatuses.has(value as IntentionStatus)
  );
}

export function isIntentionEventType(
  value: unknown
): value is IntentionHistoryEventType {
  return (
    typeof value === 'string' &&
    intentionEventTypes.has(value as IntentionHistoryEventType)
  );
}

export function isFocusPeriod(value: unknown): value is IntentionFocusPeriod {
  return (
    typeof value === 'string' && focusPeriods.has(value as IntentionFocusPeriod)
  );
}

export function isWeeklyOutcome(value: unknown): value is WeeklyOutcome {
  return (
    typeof value === 'string' && weeklyOutcomes.has(value as WeeklyOutcome)
  );
}

export function isWeeklyAdjustment(value: unknown): value is WeeklyAdjustment {
  return (
    typeof value === 'string' &&
    weeklyAdjustments.has(value as WeeklyAdjustment)
  );
}

export function isWeeklyHelpfulAction(
  value: unknown
): value is WeeklyHelpfulAction {
  return (
    typeof value === 'string' &&
    weeklyHelpfulActions.has(value as WeeklyHelpfulAction)
  );
}

export function isSkillId(value: unknown): value is SkillId {
  return typeof value === 'string' && skillIds.has(value as SkillId);
}
