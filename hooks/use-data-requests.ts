'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient, apiClientBlob } from '@/lib/api-client';

export interface DataRequestRecord {
  id: string;
  title?: string;
  type: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  result_expires_at?: string;
  failure_code?: string;
  retry_count?: number;
}

export function useDataRequests() {
  const [requests, setRequests] = useState<DataRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<'export' | 'delete' | null>(
    null
  );
  const [error, setError] = useState<unknown>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient<DataRequestRecord[]>('/data-requests');
      setRequests(data ?? []);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    apiClient<DataRequestRecord[]>('/data-requests')
      .then((data) => {
        if (!active) return;
        setRequests(data ?? []);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(requestError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const createRequest = useCallback(
    async (type: 'export' | 'delete') => {
      setSubmitting(type);
      try {
        await apiClient('/data-requests', {
          method: 'POST',
          body: JSON.stringify({ type }),
        });
        await refetch();
      } finally {
        setSubmitting(null);
      }
    },
    [refetch]
  );

  const downloadExport = useCallback(async (id: string) => {
    const blob = await apiClientBlob(`/data-requests/${id}/download`);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'gamblock-ai-account-export.zip';
    anchor.click();
    URL.revokeObjectURL(url);
  }, []);

  return {
    requests,
    loading,
    submitting,
    error,
    refetch,
    createRequest,
    downloadExport,
  };
}
