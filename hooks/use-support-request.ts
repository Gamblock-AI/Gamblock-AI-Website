'use client';

import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useApiQuery } from './use-api';

export interface SupportCaseRecord {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export function useSupportRequest() {
  const [submitting, setSubmitting] = useState(false);
  const { data, loading, error, refetch } =
    useApiQuery<SupportCaseRecord[]>('/support-cases');

  const createCase = useCallback(
    async ({
      summary,
      priority,
      type,
    }: {
      summary: string;
      priority: string;
      type: string;
    }) => {
      setSubmitting(true);
      try {
        await apiClient('/support-cases', {
          method: 'POST',
          body: JSON.stringify({ summary, priority, type }),
        });
        await refetch();
      } finally {
        setSubmitting(false);
      }
    },
    [refetch]
  );

  return {
    submitting,
    createCase,
    cases: data ?? [],
    loading,
    error,
    refetch,
  };
}
