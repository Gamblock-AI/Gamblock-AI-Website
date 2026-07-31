'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

import { apiClient } from '@/lib/api-client';
import {
  publishExperience,
  publishMissionSummary,
} from '@/lib/recovery/experience-store';

export interface DailyMissionTask {
  id: string;
  number?: number;
  key: string;
  source: 'system' | 'custom';
  system_key?: string;
  title?: string;
  completed: boolean;
  claimable: boolean;
  status: 'locked' | 'claimable' | 'claimed' | 'completed' | 'skipped' | 'pending';
  claim_mode: 'verified' | 'self_attested';
  verification_key?: string;
  exp_reward: number;
}

export interface ExperienceProgress {
  total_exp: number;
  level: number;
  level_progress: number;
  level_target: number;
  newly_unlocked?: string[];
}

export interface DailyMission {
  id: string;
  user_id: string;
  date: string;
  tasks: DailyMissionTask[];
  experience: ExperienceProgress;
  completed_count: number;
  resolved_count: number;
  total_count: number;
  created_at: string;
  updated_at: string;
}

export type DailyMissionItem = DailyMissionTask;

export interface UseDailyMissionResult {
  mission: DailyMission | null;
  items: DailyMissionItem[];
  loading: boolean;
  error: Error | null;
  updatingMissionID: string | null;
  refetch: () => Promise<void>;
  claimMission: (missionID: string) => Promise<ExperienceProgress | null>;
  createCustomMission: (title: string) => Promise<boolean>;
  updateCustomMission: (missionID: string, title: string) => Promise<boolean>;
  deleteCustomMission: (missionID: string) => Promise<boolean>;
}

interface MissionSnapshot {
  mission: DailyMission | null;
  loading: boolean;
  error: Error | null;
}

const initialSnapshot: MissionSnapshot = {
  mission: null,
  loading: true,
  error: null,
};

let snapshot = initialSnapshot;
let requestInFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function publishMission(mission: DailyMission) {
  publishExperience(mission.experience);
  publishMissionSummary({
    date: mission.date,
    resolved: mission.resolved_count,
    total: mission.total_count,
  });
}

function setSnapshot(next: MissionSnapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error('Mission request failed');
}

async function loadToday(force = false) {
  if (requestInFlight && !force) return requestInFlight;
  setSnapshot({ ...snapshot, loading: true, error: null });
  requestInFlight = apiClient<DailyMission>('/missions/today')
    .then((mission) => {
      publishMission(mission);
      setSnapshot({ mission, loading: false, error: null });
    })
    .catch((error: unknown) => {
      setSnapshot({ ...snapshot, loading: false, error: toError(error) });
    })
    .finally(() => {
      requestInFlight = null;
    });
  return requestInFlight;
}

export function useDailyMission(): UseDailyMissionResult {
  const state = useSyncExternalStore(subscribe, () => snapshot, () => initialSnapshot);
  const [updatingMissionID, setUpdatingMissionID] = useState<string | null>(null);

  useEffect(() => {
    void loadToday();
  }, []);

  const applyMutation = useCallback(async <T extends DailyMission>(
    missionID: string,
    request: () => Promise<T>
  ) => {
    if (requestInFlight) return null;
    setUpdatingMissionID(missionID);
    setSnapshot({ ...snapshot, error: null });
    try {
      const mission = await request();
      publishMission(mission);
      setSnapshot({ mission, loading: false, error: null });
      return mission;
    } catch (error) {
      setSnapshot({ ...snapshot, error: toError(error) });
      return null;
    } finally {
      setUpdatingMissionID(null);
    }
  }, []);

  const claimMission = useCallback(
    async (missionID: string) => {
      const updated = await applyMutation(missionID, () =>
        apiClient<DailyMission>('/missions/claim', {
          method: 'POST',
          body: JSON.stringify({ mission_id: missionID }),
        })
      );
      return updated?.experience ?? null;
    },
    [applyMutation]
  );

  const createCustomMission = useCallback(
    async (title: string) =>
      Boolean(
        await applyMutation('custom:create', () =>
          apiClient<DailyMission>('/missions/custom', {
            method: 'POST',
            body: JSON.stringify({ title }),
          })
        )
      ),
    [applyMutation]
  );

  const updateCustomMission = useCallback(
    async (missionID: string, title: string) =>
      Boolean(
        await applyMutation(missionID, () =>
          apiClient<DailyMission>(`/missions/custom/${encodeURIComponent(missionID)}`, {
            method: 'PATCH',
            body: JSON.stringify({ title }),
          })
        )
      ),
    [applyMutation]
  );

  const deleteCustomMission = useCallback(
    async (missionID: string) =>
      Boolean(
        await applyMutation(missionID, () =>
          apiClient<DailyMission>(`/missions/custom/${encodeURIComponent(missionID)}`, {
            method: 'DELETE',
          })
        )
      ),
    [applyMutation]
  );

  return {
    mission: state.mission,
    items: state.mission?.tasks ?? [],
    loading: state.loading,
    error: state.error,
    updatingMissionID,
    refetch: () => loadToday(true),
    claimMission,
    createCustomMission,
    updateCustomMission,
    deleteCustomMission,
  };
}
