'use client';

import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useApiQuery } from './use-api';

export type JournalDocument = Record<string, unknown>;

export interface DailyJournalEntry {
  id: string;
  journal_date: string;
  document: JournalDocument;
  created_at: string;
  updated_at: string;
}

export function useDailyJournal() {
  const today = useApiQuery<DailyJournalEntry | null>('/journal/today');
  const history = useApiQuery<DailyJournalEntry[]>('/journal');
  const [saving, setSaving] = useState(false);

  const save = useCallback(
    async (document: JournalDocument) => {
      setSaving(true);
      try {
        await apiClient<DailyJournalEntry>('/journal/today', {
          method: 'PUT',
          body: JSON.stringify({ document }),
        });
        await Promise.all([today.refetch(), history.refetch()]);
      } finally {
        setSaving(false);
      }
    },
    [history, today]
  );

  return {
    entry: today.data,
    history: history.data || [],
    loading: today.loading || history.loading,
    error: today.error || history.error,
    saving,
    save,
    refetch: today.refetch,
  };
}
