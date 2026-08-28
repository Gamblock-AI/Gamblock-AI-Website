'use client';

import { useEffect } from 'react';
import { useApiQuery, type UseQueryResult } from './use-api';

export interface AnalyticsTotals {
  blocked: number;
  interventions: number;
  tamper_events: number;
  permission_revoked: number;
}

export interface AnalyticsDay {
  date: string;
  blocked: number;
  interventions: number;
  tamper_events: number;
  permission_revoked: number;
}

export interface AnalyticsHour {
  hour: number;
  count: number;
}

export interface AnalyticsSummary {
  period_days: number;
  totals: AnalyticsTotals;
  daily: AnalyticsDay[];
  hourly: AnalyticsHour[];
  data_state: 'empty' | 'local_only' | 'synced';
  member_count: number;
  shared_member_count: number;
  protected_users?: number;
}

export type AnalyticsPeriod = 14 | 30;

const EMPTY_TOTALS: AnalyticsTotals = {
  blocked: 0,
  interventions: 0,
  tamper_events: 0,
  permission_revoked: 0,
};

export const EMPTY_ANALYTICS: AnalyticsSummary = {
  period_days: 14,
  totals: EMPTY_TOTALS,
  daily: [],
  hourly: [],
  data_state: 'empty',
  member_count: 0,
  shared_member_count: 0,
};

function useLiveAnalytics(
  path: string,
  enabled = true
): UseQueryResult<AnalyticsSummary> {
  const query = useApiQuery<AnalyticsSummary>(path, enabled);
  const { refetch } = query;

  useEffect(() => {
    if (!enabled) return;
    const refresh = () => {
      void refetch();
    };
    const interval = window.setInterval(refresh, 15000);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
    };
  }, [enabled, refetch]);

  return query;
}

export function usePartnerAnalytics(
  days: AnalyticsPeriod,
  groupId?: string,
  enabled = true
): UseQueryResult<AnalyticsSummary> {
  const params = new URLSearchParams({ days: String(days) });
  if (groupId) params.set('group_id', groupId);
  return useLiveAnalytics(
    `/accountability/analytics?${params.toString()}`,
    enabled
  );
}

export function usePlatformAnalytics(
  days: AnalyticsPeriod,
  enabled = true
): UseQueryResult<AnalyticsSummary> {
  return useLiveAnalytics(`/admin/analytics?days=${days}`, enabled);
}
