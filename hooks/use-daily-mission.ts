'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { apiClient } from '@/lib/api-client';
import {
  DAILY_MISSION_CATALOG,
  type MissionCatalogItem,
} from '@/lib/recovery/mission-catalog';
import type { MissionNumber } from '@/lib/recovery/types';

export interface DailyMissionTask {
  number: MissionNumber;
  key: string;
  role: 'primary' | 'bonus';
  completed: boolean;
  claimable: boolean;
  status: 'locked' | 'claimable' | 'claimed' | 'skipped';
  verification_key: string;
  exp_reward: number;
  replaced_from?: MissionNumber;
}

export type MissionAdjustmentReason =
  | 'not_enough_time'
  | 'not_a_good_fit'
  | 'need_lower_effort'
  | 'accessibility_need'
  | 'prefer_not_to_say';

export interface MissionAdjustment {
  original_number: MissionNumber;
  action: 'skip' | 'replace';
  reason: MissionAdjustmentReason;
  replacement_number?: MissionNumber;
  adjusted_at: string;
}

export interface ExperienceProgress {
  total_exp: number;
  level: number;
  level_progress: number;
  level_target: number;
}

export interface DailyMission {
  id: string;
  user_id: string;
  date: string;
  mission_1: boolean;
  mission_2: boolean;
  mission_3: boolean;
  mission_4: boolean;
  mission_5: boolean;
  tasks: DailyMissionTask[];
  experience: ExperienceProgress;
  completed_count: number;
  resolved_count: number;
  total_count: number;
  adjustment?: MissionAdjustment;
  replacement_options: MissionNumber[];
  created_at: string;
  updated_at: string;
}

export interface DailyMissionItem extends MissionCatalogItem {
  role: DailyMissionTask['role'];
  completed: boolean;
  claimable: boolean;
  status: DailyMissionTask['status'];
  verificationKey: string;
  expReward: number;
  replacedFrom?: MissionNumber;
}

export interface UseDailyMissionResult {
  mission: DailyMission | null;
  items: DailyMissionItem[];
  loading: boolean;
  error: Error | null;
  updatingMissionNumber: MissionNumber | null;
  refetch: () => Promise<void>;
  claimMission: (missionNumber: MissionNumber) => Promise<boolean>;
  adjustMission: (input: {
    missionNumber: MissionNumber;
    action: 'skip' | 'replace';
    reason: MissionAdjustmentReason;
    replacementNumber?: MissionNumber;
  }) => Promise<boolean>;
}

function requestTodayMission(): Promise<DailyMission> {
  return apiClient<DailyMission>('/missions/today');
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error('Mission request failed');
}

export function useDailyMission(): UseDailyMissionResult {
  const [mission, setMission] = useState<DailyMission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [updatingMissionNumber, setUpdatingMissionNumber] =
    useState<MissionNumber | null>(null);
  const mountedRef = useRef(true);
  const mutationInFlightRef = useRef(false);
  const loadSequenceRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    const requestSequence = ++loadSequenceRef.current;

    void requestTodayMission().then(
      (data) => {
        if (
          !mountedRef.current ||
          requestSequence !== loadSequenceRef.current
        ) {
          return;
        }
        setMission(data);
        setError(null);
        setLoading(false);
      },
      (requestError: unknown) => {
        if (
          !mountedRef.current ||
          requestSequence !== loadSequenceRef.current
        ) {
          return;
        }
        setError(toError(requestError));
        setLoading(false);
      }
    );

    return () => {
      mountedRef.current = false;
      loadSequenceRef.current += 1;
    };
  }, []);

  const refetch = useCallback(async () => {
    if (mutationInFlightRef.current) return;

    const requestSequence = ++loadSequenceRef.current;
    setLoading(true);
    setError(null);

    try {
      const data = await requestTodayMission();
      if (!mountedRef.current || requestSequence !== loadSequenceRef.current) {
        return;
      }
      setMission(data);
    } catch (requestError) {
      if (!mountedRef.current || requestSequence !== loadSequenceRef.current) {
        return;
      }
      setError(toError(requestError));
    } finally {
      if (mountedRef.current && requestSequence === loadSequenceRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const claimMission = useCallback(
    async (missionNumber: MissionNumber) => {
      if (mutationInFlightRef.current || loading || !mission) return false;

      mutationInFlightRef.current = true;
      loadSequenceRef.current += 1;
      const previousMission = mission;

      setUpdatingMissionNumber(missionNumber);
      setError(null);

      try {
        const updatedMission = await apiClient<DailyMission>(
          '/missions/claim',
          {
            method: 'POST',
            body: JSON.stringify({
              mission_number: missionNumber,
            }),
          }
        );
        if (mountedRef.current) setMission(updatedMission);
        return true;
      } catch (requestError) {
        if (mountedRef.current) {
          setMission(previousMission);
          setError(toError(requestError));
        }
        return false;
      } finally {
        mutationInFlightRef.current = false;
        if (mountedRef.current) setUpdatingMissionNumber(null);
      }
    },
    [loading, mission]
  );

  const adjustMission = useCallback(
    async ({
      missionNumber,
      action,
      reason,
      replacementNumber,
    }: {
      missionNumber: MissionNumber;
      action: 'skip' | 'replace';
      reason: MissionAdjustmentReason;
      replacementNumber?: MissionNumber;
    }) => {
      if (mutationInFlightRef.current || loading || !mission) return false;

      mutationInFlightRef.current = true;
      loadSequenceRef.current += 1;
      const previousMission = mission;
      setUpdatingMissionNumber(missionNumber);
      setError(null);

      try {
        const updatedMission = await apiClient<DailyMission>(
          '/missions/adjust',
          {
            method: 'POST',
            body: JSON.stringify({
              mission_number: missionNumber,
              action,
              reason,
              ...(replacementNumber
                ? { replacement_number: replacementNumber }
                : {}),
            }),
          }
        );
        if (mountedRef.current) setMission(updatedMission);
        return true;
      } catch (requestError) {
        if (mountedRef.current) {
          setMission(previousMission);
          setError(toError(requestError));
        }
        return false;
      } finally {
        mutationInFlightRef.current = false;
        if (mountedRef.current) setUpdatingMissionNumber(null);
      }
    },
    [loading, mission]
  );

  const items = (mission?.tasks ?? []).flatMap((task) => {
    const catalogItem = DAILY_MISSION_CATALOG.find(
      (item) => item.number === task.number
    );
    if (!catalogItem) return [];
    return [
      {
        ...catalogItem,
        role: task.role,
        completed: task.completed,
        claimable: task.claimable,
        status: task.status,
        verificationKey: task.verification_key,
        expReward: task.exp_reward,
        replacedFrom: task.replaced_from,
      },
    ];
  });

  return {
    mission,
    items,
    loading,
    error,
    updatingMissionNumber,
    refetch,
    claimMission,
    adjustMission,
  };
}
