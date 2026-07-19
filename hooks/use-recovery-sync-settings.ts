'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { getRecoverySnapshot } from '@/lib/recovery/store';
import {
  getRecoverySyncPreferences,
  setRecoverySyncPreference,
  type RecoverySyncCategory,
  type RecoverySyncPreferences,
} from '@/lib/recovery/sync-preferences';

const DEFAULT_PREFERENCES: RecoverySyncPreferences = { intentions: false };

export function useRecoverySyncSettings() {
  const [preferences, setPreferences] =
    useState<RecoverySyncPreferences>(DEFAULT_PREFERENCES);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setPreferences(getRecoverySyncPreferences());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const syncActiveIntention = useCallback(async () => {
    const intention = getRecoverySnapshot().intentions.find(
      (candidate) => candidate.status === 'active'
    );
    if (!intention) return;
    await apiClient('/intentions', {
      method: 'POST',
      body: JSON.stringify({
        intention_text: intention.title,
        status: intention.status,
      }),
    });
  }, []);

  const toggle = useCallback(
    async (category: RecoverySyncCategory) => {
      const enabled = !preferences[category];
      setRecoverySyncPreference(category, enabled);
      setPreferences((current) => ({ ...current, [category]: enabled }));
      setError(false);
      if (!enabled) return;

      setBusy(true);
      try {
        await syncActiveIntention();
      } catch {
        setError(true);
      } finally {
        setBusy(false);
      }
    },
    [preferences, syncActiveIntention]
  );

  const retry = useCallback(async () => {
    setBusy(true);
    setError(false);
    try {
      await syncActiveIntention();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }, [syncActiveIntention]);

  return { preferences, busy, error, toggle, retry };
}
