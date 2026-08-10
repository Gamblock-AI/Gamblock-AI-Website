'use client';

import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { publishExperience } from '@/lib/recovery/experience-store';
import type { ExperienceProgress } from './use-daily-mission';
import { useApiQuery } from './use-api';

export interface RecoveryPracticeSession {
  id: string;
  practice_kind: string;
  duration_seconds: number;
  feedback?: string;
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

export function useRecoveryExperience() {
  const space = useApiQuery<RecoverySpace>('/recovery-space');
  const practices = useApiQuery<RecoveryPracticeSession[]>(
    '/recovery-practices'
  );
  const weeklyReview = useApiQuery<WeeklyReview>('/weekly-reviews/current');
  const [saving, setSaving] = useState(false);

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

  return {
    space,
    practices,
    weeklyReview,
    saving,
    saveWeeklyReview,
  };
}
