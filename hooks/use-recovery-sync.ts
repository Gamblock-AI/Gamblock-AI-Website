'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { getLocalDateString, hydrateFromServer } from '@/lib/recovery/store';
import { useLocalUser } from '@/hooks/use-local-user';
import { getRecoverySyncPreferences } from '@/lib/recovery/sync-preferences';

import {
  DailyCheckIn,
  RecoveryIntention,
  MoodLevel,
  UrgeLevel,
} from '@/lib/recovery/types';

interface SyncIntention {
  id: string;
  intention_text: string;
  status: 'active' | 'paused' | 'archived';
  created_at: string;
  updated_at: string;
}

interface SyncCheckIn {
  id: string;
  mood_score: number;
  urge_score: number;
  created_at: string;
}

export function useRecoverySync() {
  const user = useLocalUser();
  const [syncRevision, setSyncRevision] = useState(0);

  useEffect(() => {
    const refresh = () => setSyncRevision((current) => current + 1);
    window.addEventListener('gamblock:recovery-sync-changed', refresh);
    return () =>
      window.removeEventListener('gamblock:recovery-sync-changed', refresh);
  }, []);

  useEffect(() => {
    if (user.role !== 'user') return;

    let active = true;

    const preferences = getRecoverySyncPreferences();
    if (!preferences.intentions) {
      apiClient<SyncCheckIn[]>('/check-ins')
        .then((checkInsRes) => {
          if (!active) return;
          hydrateFromServer([], toRecoveryCheckIns(checkInsRes));
        })
        .catch(() => null);
      return () => {
        active = false;
      };
    }

    Promise.all([
      preferences.intentions
        ? apiClient<SyncIntention>('/intentions').catch(() => null)
        : Promise.resolve(null),
      apiClient<SyncCheckIn[]>('/check-ins').catch(() => null),
    ]).then(([intentionRes, checkInsRes]) => {
      if (!active) return;

      const intentions: RecoveryIntention[] = [];
      if (intentionRes && intentionRes.id) {
        intentions.push({
          id: intentionRes.id,
          title: intentionRes.intention_text,
          nextAction: '',
          focusPeriod: 'this_week',
          status: intentionRes.status,
          createdAt: intentionRes.created_at,
          updatedAt: intentionRes.updated_at || intentionRes.created_at,
        });
      }

      const checkIns = checkInsRes ? toRecoveryCheckIns(checkInsRes) : [];

      if (intentions.length > 0 || checkIns.length > 0) {
        hydrateFromServer(intentions, checkIns);
      }
    });

    return () => {
      active = false;
    };
  }, [syncRevision, user]);
}

function toRecoveryCheckIns(checkIns: SyncCheckIn[]): DailyCheckIn[] {
  return checkIns.map((checkIn) => ({
    id: checkIn.id,
    date: getLocalDateString(new Date(checkIn.created_at)),
    mood: checkIn.mood_score as MoodLevel,
    urge:
      checkIn.urge_score === 0
        ? null
        : (checkIn.urge_score as UrgeLevel),
    recordedAt: checkIn.created_at,
  }));
}
