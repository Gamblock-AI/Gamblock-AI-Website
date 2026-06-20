'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

export interface DashboardSummary {
  user_name: string;
  protection_label: string;
  blocked_attempts: number;
  active_days: number;
  current_streak: number;
}

export interface ProtectionStatus {
  mode: string;
  runtime_status: string;
  ruleset_version: string;
  model_version: string;
  last_sync: string;
}

export function useDashboardData() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [protectionStatus, setProtectionStatus] =
    useState<ProtectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sData, pData] = await Promise.all([
        apiClient<DashboardSummary>('/client/dashboard-summary'),
        apiClient<ProtectionStatus>('/client/protection-status'),
      ]);
      setSummary(sData);
      setProtectionStatus(pData);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount. setState only after `await` (lint-safe, no setTimeout).
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [sData, pData] = await Promise.all([
          apiClient<DashboardSummary>('/client/dashboard-summary'),
          apiClient<ProtectionStatus>('/client/protection-status'),
        ]);
        if (!active) return;
        setSummary(sData);
        setProtectionStatus(pData);
      } catch (err) {
        if (!active) return;
        console.error(err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return {
    summary,
    protectionStatus,
    loading,
    error,
    refetch: fetchData,
  };
}
