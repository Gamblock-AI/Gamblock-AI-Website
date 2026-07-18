import type {
  MissionNumber,
  MoodLevel,
  SkillId,
  SkillReasonCode,
} from '@/lib/recovery/types';

export const moodCopy: Record<MoodLevel, `mood${MoodLevel}`> = {
  1: 'mood1',
  2: 'mood2',
  3: 'mood3',
  4: 'mood4',
  5: 'mood5',
};

export const missionMinutes: Record<MissionNumber, number> = {
  1: 2,
  2: 1,
  3: 2,
  4: 5,
  5: 5,
};

export const skillCopy: Record<
  SkillId,
  { title: string; summary: string; practice: string }
> = {
  grounding_reset: {
    title: 'skillPauseTitle',
    summary: 'skillPauseSummary',
    practice: 'skillPausePractice',
  },
  gentle_movement: {
    title: 'skillMoveTitle',
    summary: 'skillMoveSummary',
    practice: 'skillMovePractice',
  },
  focus_sprint: {
    title: 'skillFocusTitle',
    summary: 'skillFocusSummary',
    practice: 'skillFocusPractice',
  },
  budgeting_basics: {
    title: 'skillBudgetTitle',
    summary: 'skillBudgetSummary',
    practice: 'skillBudgetPractice',
  },
  creative_reset: {
    title: 'skillCreativeTitle',
    summary: 'skillCreativeSummary',
    practice: 'skillCreativePractice',
  },
  social_connection: {
    title: 'skillReachTitle',
    summary: 'skillReachSummary',
    practice: 'skillReachPractice',
  },
};

export const skillReasonCopy: Record<SkillReasonCode, string> = {
  high_urge_pause: 'reasonStrongUrge',
  moderate_urge_redirect: 'reasonDefault',
  low_mood_gentle_start: 'reasonLowMood',
  steady_mood_build_routine: 'reasonCalm',
  balanced_check_in: 'reasonDefault',
};

export const todaySteps = [
  { number: 1, key: 'stepIntention' },
  { number: 2, key: 'stepCheckIn' },
  { number: 3, key: 'stepMission' },
  { number: 4, key: 'stepLearn' },
] as const;
