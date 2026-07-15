export const RECOVERY_STORAGE_VERSION = 1 as const;

export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type UrgeLevel = 1 | 2 | 3 | 4 | 5;
export type MissionNumber = 1 | 2 | 3 | 4 | 5;

export type IntentionStatus = 'active' | 'paused' | 'archived';
export type IntentionHistoryEventType =
  | 'created'
  | 'updated'
  | 'paused'
  | 'resumed'
  | 'archived';
export type IntentionFocusPeriod =
  | 'today'
  | 'this_week'
  | 'two_weeks'
  | 'one_month';

export interface RecoveryIntention {
  id: string;
  title: string;
  nextAction: string;
  focusPeriod: IntentionFocusPeriod;
  status: IntentionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IntentionHistoryEvent {
  id: string;
  intentionId: string;
  type: IntentionHistoryEventType;
  occurredAt: string;
}

export interface CreateIntentionInput {
  title: string;
  nextAction?: string;
  focusPeriod?: IntentionFocusPeriod;
}

export interface UpdateIntentionInput {
  title?: string;
  nextAction?: string;
  focusPeriod?: IntentionFocusPeriod;
}

export interface DailyCheckIn {
  id: string;
  /** Local calendar date in YYYY-MM-DD form. */
  date: string;
  mood: MoodLevel;
  urge: UrgeLevel | null;
  recordedAt: string;
}

export interface DailyCheckInInput {
  date?: string;
  mood: MoodLevel;
  urge?: UrgeLevel | null;
}

export interface SelectedMissionAlternative {
  /** Local calendar date in YYYY-MM-DD form. */
  date: string;
  missionNumber: MissionNumber;
  selectedAt: string;
}

export type WeeklyOutcome = 'helped' | 'mixed' | 'difficult';
export type WeeklyAdjustment =
  | 'continue'
  | 'simplify'
  | 'change_focus'
  | 'pause';
export type WeeklyHelpfulAction =
  | 'pause'
  | 'trusted_person'
  | 'walk'
  | 'unsure';

export type SkillId =
  | 'grounding_reset'
  | 'gentle_movement'
  | 'focus_sprint'
  | 'budgeting_basics'
  | 'creative_reset'
  | 'social_connection';

export type SkillCategory =
  | 'emotional_regulation'
  | 'physical_wellbeing'
  | 'study_career'
  | 'financial_literacy'
  | 'creative_hobby'
  | 'social_connection';

export type SkillReasonCode =
  | 'high_urge_pause'
  | 'moderate_urge_redirect'
  | 'low_mood_gentle_start'
  | 'steady_mood_build_routine'
  | 'balanced_check_in';

export interface SkillActivity {
  id: SkillId;
  category: SkillCategory;
  title: string;
  description: string;
  durationMinutes: number;
}

export interface SkillRecommendation extends SkillActivity {
  reasonCode: SkillReasonCode;
  basedOn: {
    mood: MoodLevel;
    urge: UrgeLevel | null;
  };
}

export interface WeeklyReview {
  id: string;
  /** Monday of the reviewed local week in YYYY-MM-DD form. */
  weekStart: string;
  intentionId: string | null;
  outcome: WeeklyOutcome | null;
  helpfulAction: WeeklyHelpfulAction;
  adjustment: WeeklyAdjustment;
  nextMissionNumber: MissionNumber | null;
  selectedSkillId: SkillId | null;
  reviewedAt: string;
}

export interface SaveWeeklyReviewInput {
  weekStart?: string;
  intentionId?: string | null;
  outcome?: WeeklyOutcome | null;
  helpfulAction: WeeklyHelpfulAction;
  adjustment: WeeklyAdjustment;
  nextMissionNumber?: MissionNumber | null;
  selectedSkillId?: SkillId | null;
}

/**
 * Private recovery state stored only in this browser. It intentionally has no
 * URL, domain, browsing-history, device, partner, or free-form check-in field.
 */
export interface RecoveryState {
  version: typeof RECOVERY_STORAGE_VERSION;
  intentions: RecoveryIntention[];
  intentionHistory: IntentionHistoryEvent[];
  checkIns: DailyCheckIn[];
  selectedMissions: SelectedMissionAlternative[];
  weeklyReviews: WeeklyReview[];
}

export type RecoveryPersistence = 'local' | 'memory';
