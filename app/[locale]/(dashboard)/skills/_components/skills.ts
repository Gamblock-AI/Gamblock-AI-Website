import type { SkillId } from '@/lib/recovery/types';

export const recoverySkills: readonly {
  id: SkillId;
  title: string;
  summary: string;
  practice: string;
  minutes: number;
}[] = [
  {
    id: 'grounding_reset',
    title: 'skillPauseTitle',
    summary: 'skillPauseSummary',
    practice: 'skillPausePractice',
    minutes: 5,
  },
  {
    id: 'gentle_movement',
    title: 'skillMoveTitle',
    summary: 'skillMoveSummary',
    practice: 'skillMovePractice',
    minutes: 10,
  },
  {
    id: 'focus_sprint',
    title: 'skillFocusTitle',
    summary: 'skillFocusSummary',
    practice: 'skillFocusPractice',
    minutes: 15,
  },
  {
    id: 'budgeting_basics',
    title: 'skillBudgetTitle',
    summary: 'skillBudgetSummary',
    practice: 'skillBudgetPractice',
    minutes: 10,
  },
  {
    id: 'creative_reset',
    title: 'skillCreativeTitle',
    summary: 'skillCreativeSummary',
    practice: 'skillCreativePractice',
    minutes: 10,
  },
  {
    id: 'social_connection',
    title: 'skillReachTitle',
    summary: 'skillReachSummary',
    practice: 'skillReachPractice',
    minutes: 5,
  },
] as const;
