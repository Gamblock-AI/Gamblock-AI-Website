import type { ExperienceProgress } from '@/hooks/use-daily-mission';

/**
 * Passive module-scope store for the account's EXP/level progress. It is
 * filled by every fresh `/missions/today` response (the gamification FAB is
 * mounted on every dashboard page), so read-only surfaces such as the navbar
 * level chip stay in sync after claims without issuing their own requests.
 */
const EXPERIENCE_EVENT = 'gamblock:experience-changed';

let cachedExperience: ExperienceProgress | null = null;
const listeners = new Set<() => void>();

export function publishExperience(experience: ExperienceProgress) {
  cachedExperience = experience;
  listeners.forEach((listener) => listener());
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EXPERIENCE_EVENT));
  }
}

export function subscribeExperience(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getExperienceSnapshot(): ExperienceProgress | null {
  return cachedExperience;
}

export function getServerExperienceSnapshot(): null {
  return null;
}

/**
 * Passive daily mission summary, published beside every experience update so
 * contextual surfaces (dashboard Gami) know today's resolved/total without
 * their own fetch. Same convergence property as the experience cache.
 */
export interface MissionSummary {
  date: string;
  resolved: number;
  total: number;
}

let cachedMissionSummary: MissionSummary | null = null;
const missionListeners = new Set<() => void>();

export function publishMissionSummary(summary: MissionSummary) {
  cachedMissionSummary = summary;
  missionListeners.forEach((listener) => listener());
}

export function subscribeMissionSummary(listener: () => void) {
  missionListeners.add(listener);
  return () => {
    missionListeners.delete(listener);
  };
}

export function getMissionSummarySnapshot(): MissionSummary | null {
  return cachedMissionSummary;
}

export function getServerMissionSummarySnapshot(): null {
  return null;
}
