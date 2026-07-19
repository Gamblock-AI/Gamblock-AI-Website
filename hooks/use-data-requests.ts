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

interface CreateDataRequestResponse {
  request: DataRequestRecord;
  confirmation_preview_url?: string;
}

export function useDataRequests() {
  const [requests, setRequests] = useState<DataRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<'export' | 'delete' | null>(
    null
  );
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);

  const loadRequests = useCallback(async (showLoading: boolean) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await apiClient<DataRequestRecord[]>('/data-requests');
      setRequests(data ?? []);
    } catch (requestError) {
      setError(requestError);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => loadRequests(true), [loadRequests]);

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

  const hasProcessingExport = requests.some(
    (request) =>
      request.type === 'export' &&
      (request.status === 'queued' || request.status === 'processing')
  );

  useEffect(() => {
    if (!hasProcessingExport) return;
    const refresh = () => void loadRequests(false);
    const interval = window.setInterval(refresh, 5000);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
    };
  }, [hasProcessingExport, loadRequests]);

  const createRequest = useCallback(
    async (type: 'export' | 'delete') => {
      setSubmitting(type);
      try {
        const response = await apiClient<CreateDataRequestResponse>(
          '/data-requests',
          {
            method: 'POST',
            body: JSON.stringify({ type }),
          }
        );
        return response.request;
      } finally {
        await loadRequests(false);
        setSubmitting(null);
      }
    },
    [loadRequests]
  );

  const downloadExport = useCallback(async (id: string) => {
    setDownloadingId(id);
    try {
      const blob = await apiClientBlob(`/data-requests/${id}/download`);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'gamblock-ai-account-export.zip';
      anchor.hidden = true;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.requestAnimationFrame(() => URL.revokeObjectURL(url));
    } finally {
      setDownloadingId(null);
    }
  }, []);

  const activeExport = requests.some(
    (request) =>
      request.type === 'export' &&
      !['completed', 'failed', 'rejected', 'cancelled'].includes(request.status)
  );
  const activeDeletion = requests.some(
    (request) =>
      request.type === 'delete' &&
      !['completed', 'failed', 'rejected', 'cancelled'].includes(request.status)
  );

  return {
    requests,
    loading,
    submitting,
    downloadingId,
    error,
    activeExport,
    activeDeletion,
    refetch,
    createRequest,
    downloadExport,
  };
}
