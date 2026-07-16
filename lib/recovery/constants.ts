import type {
  IntentionFocusPeriod,
  IntentionHistoryEventType,
  IntentionStatus,
  SkillId,
  WeeklyAdjustment,
  WeeklyHelpfulAction,
  WeeklyOutcome,
} from './types';

export const RECOVERY_STORAGE_KEY = 'gamblock:recovery:v1';

export const LEGACY_STORAGE_KEYS = [
  'gamblock_intention',
  'gamblock_motivation',
  'gamblock_target_days',
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
