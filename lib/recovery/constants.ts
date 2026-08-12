import type {
  IntentionFocusPeriod,
  IntentionHistoryEventType,
  IntentionStatus,
  SkillId,
  WeeklyAdjustment,
  WeeklyHelpfulAction,
  WeeklyOutcome,
} from './types';

/**
 * Base localStorage key for the private recovery store. The store is scoped
 * per authenticated account (`${RECOVERY_STORAGE_KEY}:<accountId>`) so a new
 * account never inherits another account's check-ins, intentions, or reviews.
 * The unscoped base key is kept as the logged-out fallback.
 */
export const RECOVERY_STORAGE_KEY = 'gamblock:recovery:v1';

export function recoveryStorageKeyFor(accountId: string): string {
  return accountId ? `${RECOVERY_STORAGE_KEY}:${accountId}` : RECOVERY_STORAGE_KEY;
}

export const LEGACY_STORAGE_KEYS = [
  'gamblock_intention',
  'gamblock_motivation',
  'gamblock_target_days',
] as const;

/**
 * Local-only engagement state (day markers, daily answers, the private
 * estimator baseline). Cleared together with the recovery state so the
 * "clear local data" promise stays complete.
 */
export const ENGAGEMENT_STORAGE_KEYS = [
  'gamblock:dashboard-seen:v1',
  'gamblock:dashboard-tour:v1',
  'gamblock:partner-tour:v1',
  'gamblock:admin-tour:v1',
  'gamblock:myth-fact:v1',
  'gamblock:quick-quiz:v1',
  'gamblock:estimator:v1',
] as const;

export const recoveryLimits = {
  intentions: 20,
  intentionEvents: 120,
  checkIns: 90,
  selectedMissions: 90,
  weeklyReviews: 52,
  intentionLength: 240,
  nextActionLength: 160,
} as const;

export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const intentionStatuses = new Set<IntentionStatus>([
  'active',
  'paused',
  'archived',
]);

export const intentionEventTypes = new Set<IntentionHistoryEventType>([
  'created',
  'updated',
  'paused',
  'resumed',
  'archived',
]);

export const focusPeriods = new Set<IntentionFocusPeriod>([
  'today',
  'this_week',
  'two_weeks',
  'one_month',
]);

export const weeklyOutcomes = new Set<WeeklyOutcome>([
  'helped',
  'mixed',
  'difficult',
]);

export const weeklyAdjustments = new Set<WeeklyAdjustment>([
  'continue',
  'simplify',
  'change_focus',
  'pause',
]);

export const weeklyHelpfulActions = new Set<WeeklyHelpfulAction>([
  'pause',
  'trusted_person',
  'walk',
  'unsure',
]);

export const skillIds = new Set<SkillId>([
  'grounding_reset',
  'gentle_movement',
  'focus_sprint',
  'budgeting_basics',
  'creative_reset',
  'social_connection',
]);
