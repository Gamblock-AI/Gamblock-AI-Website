'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';

import { recommendSkills } from '@/lib/recovery/skill-catalog';
import {
  clearRecoveryData as clearStoredRecoveryData,
  createIntention as createStoredIntention,
  getLocalDateString,
  getLocalWeekStartString,
  getRecoveryPersistence,
  getRecoveryPersistenceServerSnapshot,
  getRecoveryServerSnapshot,
  getRecoverySnapshot,
  recordDailyCheckIn as recordStoredDailyCheckIn,
  saveWeeklyReview as saveStoredWeeklyReview,
  selectMissionAlternative as selectStoredMissionAlternative,
  setIntentionStatus as setStoredIntentionStatus,
  subscribeRecoveryStore,
  updateIntention as updateStoredIntention,
} from '@/lib/recovery/store';
import type {
  DailyCheckIn,
  RecoveryIntention,
  RecoveryPersistence,
  RecoveryState,
  SelectedMissionAlternative,
  SkillRecommendation,
  WeeklyReview,
} from '@/lib/recovery/types';

export interface UseRecoveryJourneyResult {
  state: RecoveryState;
  persistence: RecoveryPersistence;
  activeIntention: RecoveryIntention | null;
  todayCheckIn: DailyCheckIn | null;
  selectedMission: SelectedMissionAlternative | null;
  currentWeekReview: WeeklyReview | null;
  skillRecommendations: SkillRecommendation[];
  skillRecommendation: SkillRecommendation | null;
  createIntention: typeof createStoredIntention;
  updateIntention: typeof updateStoredIntention;
  setIntentionStatus: typeof setStoredIntentionStatus;
  recordDailyCheckIn: typeof recordStoredDailyCheckIn;
  selectMissionAlternative: typeof selectStoredMissionAlternative;
  saveWeeklyReview: typeof saveStoredWeeklyReview;
  cycleSkillRecommendation: () => void;
  clearRecoveryData: typeof clearStoredRecoveryData;
}

/**
 * Private, browser-local recovery journey state. The stable server snapshot
 * keeps SSR/hydration deterministic while the client snapshot restores the
 * versioned local state without a setState-in-effect hydration workaround.
 */
export function useRecoveryJourney(): UseRecoveryJourneyResult {
  const state = useSyncExternalStore(
    subscribeRecoveryStore,
    getRecoverySnapshot,
    getRecoveryServerSnapshot
  );
  const persistence = useSyncExternalStore(
    subscribeRecoveryStore,
    getRecoveryPersistence,
    getRecoveryPersistenceServerSnapshot
  );
  const [skillCursor, setSkillCursor] = useState(0);
  const today = getLocalDateString();
  const weekStart = getLocalWeekStartString();
  const activeIntention =
    state.intentions.find((intention) => intention.status === 'active') ?? null;
  const todayCheckIn =
    state.checkIns.find((checkIn) => checkIn.date === today) ?? null;
  const selectedMission =
    state.selectedMissions.find((mission) => mission.date === today) ?? null;
  const currentWeekReview =
    state.weeklyReviews.find((review) => review.weekStart === weekStart) ?? null;
  const skillRecommendations = recommendSkills(todayCheckIn);
  const skillRecommendation =
    skillRecommendations.length > 0
      ? skillRecommendations[skillCursor % skillRecommendations.length]
      : null;

  const cycleSkillRecommendation = useCallback(() => {
    setSkillCursor((current) => current + 1);
  }, []);

  return {
    state,
    persistence,
    activeIntention,
    todayCheckIn,
    selectedMission,
    currentWeekReview,
    skillRecommendations,
    skillRecommendation,
    createIntention: createStoredIntention,
    updateIntention: updateStoredIntention,
    setIntentionStatus: setStoredIntentionStatus,
    recordDailyCheckIn: recordStoredDailyCheckIn,
    selectMissionAlternative: selectStoredMissionAlternative,
    saveWeeklyReview: saveStoredWeeklyReview,
    cycleSkillRecommendation,
    clearRecoveryData: clearStoredRecoveryData,
  };
}
