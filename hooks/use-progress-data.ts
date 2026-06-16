'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

export interface ProgressSnapshot {
  weekly_blocks: number[];
  moods: string[];
  active_days: number;
  reflections: number;
}

export function useProgressData() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [checked, setChecked] = useState<boolean[]>(Array(5).fill(false));
  const [progress, setProgress] = useState<ProgressSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient<ProgressSnapshot>('/client/progress');
      setProgress(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      fetchProgress();
    }, 0);
  }, [fetchProgress]);

  const toggleCheck = useCallback((idx: number) => {
    setChecked((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  }, []);

  const completedCount = checked.filter(Boolean).length;

  return {
    selectedMood,
    setSelectedMood,
    checked,
    toggleCheck,
    progress,
    completedCount,
    loading,
    refetch: fetchProgress,
  };
}
