'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { useApiQuery } from './use-api';

export interface ReflectionEntry {
  id: string;
  user_id: string;
  text: string;
  mood?: string;
  mood_score?: number;
  next_step?: string;
  status: 'active' | 'archived';
  is_focus: boolean;
  payload_version: number;
  created_at: string;
  updated_at: string;
}

export function useReflections() {
  const { data, loading, error, refetch } =
    useApiQuery<ReflectionEntry[]>('/reflections');
  const [submitting, setSubmitting] = useState(false);

  const createReflection = useCallback(
    async (input: {
      text: string;
      mood_score?: number;
      next_step?: string;
      is_focus?: boolean;
    }) => {
      setSubmitting(true);
      try {
        await apiClient('/reflections', {
          method: 'POST',
          body: JSON.stringify(input),
        });
        await refetch();
      } finally {
        setSubmitting(false);
      }
    },
    [refetch]
  );

  const updateReflection = useCallback(
    async (
      id: string,
      input: Partial<
        Pick<
          ReflectionEntry,
          'text' | 'mood_score' | 'next_step' | 'status' | 'is_focus'
        >
      >
    ) => {
      setSubmitting(true);
      try {
        await apiClient(`/reflections/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          body: JSON.stringify(input),
        });
        await refetch();
      } finally {
        setSubmitting(false);
      }
    },
    [refetch]
  );

  return {
    reflections: data || [],
    loading,
    error,
    submitting,
    createReflection,
    updateReflection,
    refetch,
  };
}
