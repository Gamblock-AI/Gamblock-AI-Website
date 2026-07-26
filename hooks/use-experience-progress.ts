'use client';

import { useSyncExternalStore } from 'react';
import {
  getExperienceSnapshot,
  getServerExperienceSnapshot,
  subscribeExperience,
} from '@/lib/recovery/experience-store';

/** Read-only subscription to the shared EXP/level store (null until filled). */
export function useExperienceProgress() {
  return useSyncExternalStore(
    subscribeExperience,
    getExperienceSnapshot,
    getServerExperienceSnapshot
  );
}
