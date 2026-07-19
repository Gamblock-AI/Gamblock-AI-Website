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
  impact: string;
  owner?: string;
  unread_count: number;
  messages?: SupportMessageRecord[];
  resolved_at?: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SupportMessageRecord {
  id: string;
  support_case_id: string;
  author_role: 'requester' | 'support_operator';
  content: string;
  read_at?: string;
  created_at: string;
}

export function useSupportRequest() {
  const [submitting, setSubmitting] = useState(false);
  const { data, loading, error, refetch } =
    useApiQuery<SupportCaseRecord[]>('/support-cases');

  const createCase = useCallback(
    async ({
      summary,
      detail,
      impact,
      priority,
      type,
    }: {
      summary: string;
      detail: string;
      impact: string;
      priority: string;
      type: string;
    }) => {
      setSubmitting(true);
      try {
        await apiClient('/support-cases', {
          method: 'POST',
          body: JSON.stringify({ summary, detail, impact, priority, type }),
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

export function useSupportCase(caseId: string) {
  const [submitting, setSubmitting] = useState(false);
  const query = useApiQuery<SupportCaseRecord>(`/support-cases/${caseId}`);
  const { refetch } = query;

  const mutate = useCallback(
    async (request: Promise<unknown>) => {
      setSubmitting(true);
      try {
        await request;
        await refetch();
      } finally {
        setSubmitting(false);
      }
    },
    [refetch]
  );

  return {
    ...query,
    submitting,
    reply: (content: string) =>
      mutate(
        apiClient(`/support-cases/${caseId}/messages`, {
          method: 'POST',
          body: JSON.stringify({ content }),
        })
      ),
    transition: (status: 'closed' | 'waiting_support') =>
      mutate(
        apiClient(`/support-cases/${caseId}/transition`, {
          method: 'POST',
          body: JSON.stringify({ status }),
        })
      ),
  };
}
