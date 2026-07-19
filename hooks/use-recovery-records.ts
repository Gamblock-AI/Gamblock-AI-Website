'use client';

import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useApiQuery } from './use-api';

export type RecoveryRecordKind =
  | 'roadmap'
  | 'coping_plan'
  | 'weekly_review'
  | 'mission_reflection'
  | 'practice_log'
  | 'saved_resource'
  | 'reminder';

export interface RecoveryRecord {
  id: string;
  kind: RecoveryRecordKind;
  record_date: string;
  metadata: Record<string, unknown>;
  content?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RecoveryRecordInput {
  id?: string;
  kind: RecoveryRecordKind;
  record_date: string;
  metadata: Record<string, unknown>;
  content: string;
  status: string;
}

export function useRecoveryRecords() {
  const query = useApiQuery<RecoveryRecord[]>('/recovery-records');
  const { refetch } = query;
  const [saving, setSaving] = useState(false);

  const save = useCallback(
    async (input: RecoveryRecordInput) => {
      setSaving(true);
      try {
        const result = await apiClient<RecoveryRecord>('/recovery-records', {
          method: 'PUT',
          body: JSON.stringify(input),
        });
        await refetch();
        return result;
      } finally {
        setSaving(false);
      }
    },
    [refetch]
  );

  return {
    ...query,
    records: query.data ?? [],
    saving,
    save,
  };
}
