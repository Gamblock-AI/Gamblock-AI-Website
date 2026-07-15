'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { apiClient } from '@/lib/api-client';
import {
  DAILY_MISSION_CATALOG,
  type MissionCatalogItem,
  type MissionId,
} from '@/lib/recovery/mission-catalog';
import type { MissionNumber } from '@/lib/recovery/types';

export interface DailyMission {
  id: string;
  user_id: string;
  date: string;
  mission_1: boolean;
  mission_2: boolean;
  mission_3: boolean;
  mission_4: boolean;
  mission_5: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyMissionItem extends MissionCatalogItem {
  completed: boolean;
}

export interface UseDailyMissionResult {
  mission: DailyMission | null;
  items: DailyMissionItem[];
  loading: boolean;
  error: Error | null;
  updatingMissionNumber: MissionNumber | null;
  refetch: () => Promise<void>;
  setMissionCompleted: (
    missionNumber: MissionNumber,
    completed: boolean
  ) => Promise<boolean>;
}

const MISSION_FIELD_BY_NUMBER: Record<MissionNumber, MissionId> = {
  1: 'mission_1',
  2: 'mission_2',
  3: 'mission_3',
  4: 'mission_4',
  5: 'mission_5',
};

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
      if (
        !mountedRef.current ||
        requestSequence !== loadSequenceRef.current
      ) {
        return;
      }
      setMission(data);
    } catch (requestError) {
      if (
        !mountedRef.current ||
        requestSequence !== loadSequenceRef.current
      ) {
        return;
      }
      setError(toError(requestError));
    } finally {
      if (
        mountedRef.current &&
        requestSequence === loadSequenceRef.current
      ) {
        setLoading(false);
      }
    }
  }, []);

  const setMissionCompleted = useCallback(
    async (missionNumber: MissionNumber, completed: boolean) => {
      if (mutationInFlightRef.current || loading || !mission) return false;

      mutationInFlightRef.current = true;
      loadSequenceRef.current += 1;
      const previousMission = mission;
      const field = MISSION_FIELD_BY_NUMBER[missionNumber];

      setUpdatingMissionNumber(missionNumber);
      setError(null);
      setMission({ ...mission, [field]: completed });

      try {
        const updatedMission = await apiClient<DailyMission>('/missions', {
          method: 'PATCH',
          body: JSON.stringify({
            mission_number: missionNumber,
            completed,
          }),
        });
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

  const items = DAILY_MISSION_CATALOG.map((catalogItem) => ({
    ...catalogItem,
    completed: mission?.[catalogItem.id] ?? false,
  }));

  return {
    mission,
    items,
    loading,
    error,
    updatingMissionNumber,
    refetch,
    setMissionCompleted,
  };
}
