'use client';

import { useApiQuery } from './use-api';

export interface ProgressMoodPoint {
  date: string;
  mood: number;
  urge: number;
}

export interface ProgressSnapshot {
  weekly_blocks: number[];
  range_days: 7 | 30 | 90;
  daily_blocks: number[];
  mood_points: ProgressMoodPoint[];
  check_in_count: number;
  trend_available: boolean;
  active_days: number;
  reflections: number;
  data_state: string;
  activity_days: Array<{
    date: string;
    check_ins: number;
    practices: number;
    journals: number;
    missions: number;
    education: number;
    reviews: number;
  }>;
}

export function useProgressSnapshot(days: 7 | 30 | 90) {
  return useApiQuery<ProgressSnapshot>(`/client/progress?days=${days}`);
}
