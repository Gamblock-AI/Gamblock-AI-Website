'use client';

import { useApiQuery } from './use-api';

export interface DashboardSummary {
  user_name: string;
  protection_label: string;
  blocked_attempts: number;
  active_days: number;
  current_streak: number;
  data_state: 'synced' | 'local_only';
}

export function useDashboardSummary() {
  const { data, loading, error, refetch } = useApiQuery<DashboardSummary>(
    '/client/dashboard-summary'
  );
  return { summary: data, loading, error, refetch };
}
