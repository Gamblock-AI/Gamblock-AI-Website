'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

export interface ReminderPreference {
  enabled: boolean;
  local_time: string;
  timezone: string;
  locale: string;
}

export const DEFAULT_REMINDER_PREFERENCE: ReminderPreference = {
  enabled: false,
  local_time: '19:00',
  timezone: 'Asia/Jakarta',
  locale: 'id',
};

export function useReminderPreference() {
  const [preference, setPreference] = useState<ReminderPreference>(
    DEFAULT_REMINDER_PREFERENCE
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiClient<Partial<ReminderPreference>>(
        '/me/reminder-preference'
      );
      setPreference({ ...DEFAULT_REMINDER_PREFERENCE, ...data });
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void load();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [load]);

  const save = useCallback(async (next: ReminderPreference) => {
    setSaving(true);
    setError(false);
    try {
      const data = await apiClient<Partial<ReminderPreference>>(
        '/me/reminder-preference',
        {
          method: 'PUT',
          body: JSON.stringify(next),
        }
      );
      setPreference({ ...DEFAULT_REMINDER_PREFERENCE, ...data });
    } catch {
      setError(true);
      throw new Error('reminder_preference_update_failed');
    } finally {
      setSaving(false);
    }
  }, []);

  return { preference, loading, saving, error, load, save };
}
