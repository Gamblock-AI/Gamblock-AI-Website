import { apiClient } from '@/lib/api-client';
import { recoveryLimits } from './constants';
import { createId, getLocalDateString } from './date';
import { reportSyncFailure, updateRecoveryState } from './runtime';
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
): Promise<DailyCheckIn | null> {
  if (!isMoodLevel(input.mood)) return Promise.resolve(null);
  if (
    input.urge !== undefined &&
    input.urge !== null &&
    !isUrgeLevel(input.urge)
  ) {
    return Promise.resolve(null);
  }

  const date = isDateString(input.date) ? input.date : getLocalDateString();
  const now = new Date().toISOString();
  const nextCheckIn: DailyCheckIn = {
    id: createId('checkin'),
    date,
    mood: input.mood,
    urge: input.urge ?? null,
    recordedAt: now,
  };

  return apiClient('/check-ins', {
    method: 'POST',
    body: JSON.stringify({
      mood_score: nextCheckIn.mood,
      urge_score: nextCheckIn.urge ?? 0,
      context_text: '',
    }),
  })
    .then(() => {
      updateRecoveryState((state) => ({
        ...state,
        checkIns: [
          nextCheckIn,
          ...state.checkIns.filter((checkIn) => checkIn.date !== date),
        ].slice(0, recoveryLimits.checkIns),
      }));
      return nextCheckIn;
    })
    .catch(() => {
      reportSyncFailure('checkIns');
      return null;
    });
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
