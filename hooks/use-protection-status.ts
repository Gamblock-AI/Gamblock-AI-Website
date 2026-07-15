'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/api-client';

export interface ProtectionStatus {
  mode: string;
  runtime_status: string;
  ruleset_version: string;
  model_version: string;
  last_sync: string;
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error('Protection status request failed');
}

export function useProtectionStatus() {
  const [status, setStatus] = useState<ProtectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);
  const requestRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      const nextStatus = await apiClient<ProtectionStatus>('/client/protection-status');
      if (!mountedRef.current || requestId !== requestRef.current) return;
      setStatus(nextStatus);
    } catch (requestError) {
      if (!mountedRef.current || requestId !== requestRef.current) return;
      setError(toError(requestError));
    } finally {
      if (mountedRef.current && requestId === requestRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const requestId = ++requestRef.current;
    void apiClient<ProtectionStatus>('/client/protection-status').then(
      (nextStatus) => {
        if (!mountedRef.current || requestId !== requestRef.current) return;
        setStatus(nextStatus);
        setError(null);
        setLoading(false);
      },
      (requestError: unknown) => {
        if (!mountedRef.current || requestId !== requestRef.current) return;
        setError(toError(requestError));
        setLoading(false);
      },
    );
    return () => {
      mountedRef.current = false;
      requestRef.current += 1;
    };
  }, []);

  return { status, loading, error, refetch: load };
}
