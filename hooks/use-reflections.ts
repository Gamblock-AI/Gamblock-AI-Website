'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { useApiQuery } from './use-api';

export interface ReflectionEntry {
  id: string;
  user_id: string;
  text: string;
  mood: string;
  created_at: string;
  updated_at: string;
}

export function useReflections() {
  const { data, loading, error, refetch } = useApiQuery<ReflectionEntry[]>('/reflections');
  const [submitting, setSubmitting] = useState(false);

  const createReflection = useCallback(async (text: string, mood: string) => {
    setSubmitting(true);
    try {
      await apiClient('/reflections', {
        method: 'POST',
        body: JSON.stringify({ text, mood })
      });
      await refetch();
    } finally {
      setSubmitting(false);
    }
  }, [refetch]);

  return {
    reflections: data || [],
    loading,
    error,
    submitting,
    createReflection,
    refetch,
  };
}
