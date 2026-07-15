'use client';

import { useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { hydrateFromServer } from '@/lib/recovery/store';
import { useLocalUser } from '@/hooks/use-local-user';

import { DailyCheckIn, RecoveryIntention, MoodLevel, UrgeLevel } from '@/lib/recovery/types';

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
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!user || hasSynced.current) return;
    
    let active = true;
    hasSynced.current = true;

    Promise.all([
      apiClient<SyncIntention>('/intentions').catch(() => null),
      apiClient<SyncCheckIn[]>('/check-ins').catch(() => null)
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
          updatedAt: intentionRes.updated_at || intentionRes.created_at
        });
      }

      const checkIns: DailyCheckIn[] = [];
      if (checkInsRes && Array.isArray(checkInsRes)) {
        checkInsRes.forEach(chk => {
          // Parse string date to local format if needed. Server gives full ISO time.
          // Store expects YYYY-MM-DD for date
          const dateObj = new Date(chk.created_at);
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          
          checkIns.push({
            id: chk.id,
            date: `${year}-${month}-${day}`,
            mood: chk.mood_score as MoodLevel,
            urge: chk.urge_score as UrgeLevel,
            recordedAt: chk.created_at
          });
        });
      }

      if (intentions.length > 0 || checkIns.length > 0) {
        hydrateFromServer(intentions, checkIns);
      }
    });

    return () => {
      active = false;
    };
  }, [user]);
}
