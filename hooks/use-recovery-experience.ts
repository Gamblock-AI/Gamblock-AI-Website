'use client';

import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useApiQuery } from './use-api';

export type RecoveryPracticeKind =
  | 'urge_surfing'
  | 'grounding_54321'
  | 'focus_sprint';
export type RecoveryFeedback =
  | 'lighter'
  | 'same'
  | 'heavier'
  | 'prefer_not_say';

export interface RecoveryPracticeSession {
  id: string;
  practice_kind: RecoveryPracticeKind;
  duration_seconds: number;
  feedback?: RecoveryFeedback;
  completed_at: string;
}

export interface RecoverySpace {
  id: string;
  theme: 'dorm_room';
  unlocked_items: string[];
  placed_items: Record<string, unknown>;
  unlock_rule_version: number;
  updated_at: string;
}

export interface WeeklyReview {
  id?: string;
  week_start: string;
  what_helped: string[];
  what_was_hard: string[];
  adjustment: string;
  next_mission: string;
  recommended_skill?: string;
  updated_at?: string;
}

export function useRecoveryExperience() {
  const space = useApiQuery<RecoverySpace>('/recovery-space');
  const practices = useApiQuery<RecoveryPracticeSession[]>(
    '/recovery-practices'
  );
  const weeklyReview = useApiQuery<WeeklyReview>('/weekly-reviews/current');
  const [saving, setSaving] = useState(false);

  const completePractice = useCallback(
    async (input: {
      practice_kind: RecoveryPracticeKind;
      duration_seconds: number;
      feedback?: RecoveryFeedback;
    }) => {
      setSaving(true);
      try {
        const item = await apiClient<RecoveryPracticeSession>(
          '/recovery-practices',
          { method: 'POST', body: JSON.stringify(input) }
        );
        await Promise.all([practices.refetch(), space.refetch()]);
        return item;
      } finally {
        setSaving(false);
      }
    },
    [practices, space]
  );

  const saveWeeklyReview = useCallback(
    async (input: WeeklyReview) => {
      setSaving(true);
      try {
        const item = await apiClient<WeeklyReview>('/weekly-reviews/current', {
          method: 'PUT',
          body: JSON.stringify(input),
        });
        await Promise.all([weeklyReview.refetch(), space.refetch()]);
        return item;
      } finally {
        setSaving(false);
      }
    },
    [space, weeklyReview]
  );

  const updateSpace = useCallback(
    async (placed_items: Record<string, unknown>) => {
      setSaving(true);
      try {
        const item = await apiClient<RecoverySpace>('/recovery-space', {
          method: 'PATCH',
          body: JSON.stringify({ placed_items }),
        });
        await space.refetch();
        return item;
      } finally {
        setSaving(false);
      }
    },
    [space]
  );

  return {
    space,
    practices,
    weeklyReview,
    saving,
    completePractice,
    saveWeeklyReview,
    updateSpace,
  };
}
