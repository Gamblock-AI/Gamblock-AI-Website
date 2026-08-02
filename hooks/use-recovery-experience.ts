'use client';

import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { publishExperience } from '@/lib/recovery/experience-store';
import type { ExperienceProgress } from './use-daily-mission';
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
  exp_awarded?: number;
  experience?: ExperienceProgress;
}

export type RecoveryRoomTheme = 'dorm_room' | 'sunrise_study';

export interface RecoverySpace {
  id: string;
  theme: RecoveryRoomTheme;
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

interface WeeklyReviewSaveResult {
  review: WeeklyReview;
  exp_granted: boolean;
  cap_reached: boolean;
  experience: ExperienceProgress;
}

/** Narrow read-only practices query for surfaces that need nothing else. */
export function useRecoveryPractices() {
  return useApiQuery<RecoveryPracticeSession[]>('/recovery-practices');
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
        if (item.experience) {
          publishExperience(item.experience);
        }
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
        const result = await apiClient<WeeklyReviewSaveResult>(
          '/weekly-reviews/current',
          {
            method: 'PUT',
            body: JSON.stringify(input),
          }
        );
        publishExperience(result.experience);
        await Promise.all([weeklyReview.refetch(), space.refetch()]);
        return result.review;
      } finally {
        setSaving(false);
      }
    },
    [space, weeklyReview]
  );

  const updateSpace = useCallback(
    async (
      placed_items: Record<string, unknown>,
      theme?: RecoveryRoomTheme
    ) => {
      setSaving(true);
      try {
        const item = await apiClient<RecoverySpace>('/recovery-space', {
          method: 'PATCH',
          body: JSON.stringify(
            theme ? { placed_items, theme } : { placed_items }
          ),
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
