import { apiClient } from '@/lib/api-client';
import { recoveryLimits } from './constants';
import { createId, getLocalDateString } from './date';
import { reportSyncFailure, updateRecoveryState } from './runtime';
import { isRecoverySyncEnabled } from './sync-preferences';
import type {
  DailyCheckIn,
  DailyCheckInInput,
  MissionNumber,
  SelectedMissionAlternative,
} from './types';
import {
  isDateString,
  isMissionNumber,
  isMoodLevel,
  isUrgeLevel,
} from './validation';

export function recordDailyCheckIn(
  input: DailyCheckInInput
): DailyCheckIn | null {
  if (!isMoodLevel(input.mood)) return null;
  if (
    input.urge !== undefined &&
    input.urge !== null &&
    !isUrgeLevel(input.urge)
  ) {
    return null;
  }

  const date = isDateString(input.date) ? input.date : getLocalDateString();
  const now = new Date().toISOString();
  let savedCheckIn: DailyCheckIn | null = null;

  updateRecoveryState((state) => {
    const existing = state.checkIns.find((checkIn) => checkIn.date === date);
    const nextCheckIn: DailyCheckIn = {
      id: existing?.id ?? createId('checkin'),
      date,
      mood: input.mood,
      urge: input.urge ?? null,
      recordedAt: now,
    };
    savedCheckIn = nextCheckIn;

    return {
      ...state,
      checkIns: [
        nextCheckIn,
        ...state.checkIns.filter((checkIn) => checkIn.date !== date),
      ].slice(0, recoveryLimits.checkIns),
    };
  });

  if (savedCheckIn && isRecoverySyncEnabled('checkIns')) {
    const checkIn = savedCheckIn;
    void apiClient('/check-ins', {
      method: 'POST',
      body: JSON.stringify({
        mood_score: checkIn.mood,
        urge_score: checkIn.urge ?? 0,
        context_text: '',
      }),
    }).catch(() => reportSyncFailure('checkIns'));
  }

  return savedCheckIn;
}

export function selectMissionAlternative(
  missionNumber: MissionNumber,
  date = getLocalDateString()
): SelectedMissionAlternative | null {
  if (!isMissionNumber(missionNumber) || !isDateString(date)) return null;

  const selectedMission: SelectedMissionAlternative = {
    date,
    missionNumber,
    selectedAt: new Date().toISOString(),
  };

  updateRecoveryState((state) => ({
    ...state,
    selectedMissions: [
      selectedMission,
      ...state.selectedMissions.filter((mission) => mission.date !== date),
    ].slice(0, recoveryLimits.selectedMissions),
  }));

  return selectedMission;
}
