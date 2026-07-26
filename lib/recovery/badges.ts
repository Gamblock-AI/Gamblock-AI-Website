import {
  Award,
  BookOpen,
  CalendarCheck2,
  CalendarDays,
  Compass,
  Flag,
  Footprints,
  GraduationCap,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Target,
  Waves,
  type LucideIcon,
} from 'lucide-react';

export interface JourneyBadgeInput {
  checkInCount: number;
  activeDays: number;
  reflections: number;
  missionDays: number;
  reviewDays: number;
  educationDays: number;
  practiceKinds: ReadonlySet<string>;
  practiceCount: number;
  modulesStarted: number;
  modulesCompleted: number;
  level: number;
}

export interface JourneyBadge {
  id: string;
  icon: LucideIcon;
  achieved: boolean;
}

const ALL_PRACTICE_KINDS = [
  'urge_surfing',
  'grounding_54321',
  'focus_sprint',
] as const;

/**
 * Deterministic journey badges computed purely from participation the account
 * already recorded (90-day snapshot window where noted in the copy). Badges
 * are additive-only in spirit: criteria never involve chance, comparison, or
 * anything that can be "lost". Order is stable and mirrors the copy catalog.
 */
export function buildJourneyBadges(input: JourneyBadgeInput): JourneyBadge[] {
  return [
    {
      id: 'first_check_in',
      icon: ShieldCheck,
      achieved: input.checkInCount >= 1,
    },
    {
      id: 'five_active_days',
      icon: CalendarDays,
      achieved: input.activeDays >= 5,
    },
    {
      id: 'fifteen_active_days',
      icon: Footprints,
      achieved: input.activeDays >= 15,
    },
    { id: 'first_practice', icon: Waves, achieved: input.practiceCount >= 1 },
    {
      id: 'practice_explorer',
      icon: Compass,
      achieved: ALL_PRACTICE_KINDS.every((kind) =>
        input.practiceKinds.has(kind)
      ),
    },
    {
      id: 'first_journal',
      icon: NotebookPen,
      achieved: input.reflections >= 1,
    },
    { id: 'first_mission', icon: Target, achieved: input.missionDays >= 1 },
    { id: 'mission_ten_days', icon: Flag, achieved: input.missionDays >= 10 },
    {
      id: 'first_review',
      icon: CalendarCheck2,
      achieved: input.reviewDays >= 1,
    },
    {
      id: 'first_education',
      icon: BookOpen,
      achieved: input.educationDays >= 1 || input.modulesStarted >= 1,
    },
    {
      id: 'module_complete',
      icon: GraduationCap,
      achieved: input.modulesCompleted >= 1,
    },
    { id: 'level_five', icon: Sparkles, achieved: input.level >= 5 },
    { id: 'level_ten', icon: Award, achieved: input.level >= 10 },
  ];
}
