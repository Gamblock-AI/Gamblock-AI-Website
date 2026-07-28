import type { MoodLevel, UrgeLevel } from '@/lib/recovery/types';

/**
 * Deterministic Gami dialog selection: mood (1-5) × urge band × daily variant.
 * Copy lives in the `gamiDialog` namespace (messages/{id,en}/engagement.json).
 * Selection is pure — the daily variant rotates with the day-of-year index,
 * never with Math.random — so the same check-in shows the same reply all day.
 */
export type UrgeBand = 'None' | 'Low' | 'High';

export const GAMI_VARIANTS = 2;

export function urgeBand(urge: UrgeLevel | null | undefined): UrgeBand {
  if (!urge || urge <= 0) return 'None';
  return urge <= 2 ? 'Low' : 'High';
}

export function gamiDialogKey(
  mood: MoodLevel,
  urge: UrgeLevel | null | undefined,
  dayIndex: number
): string {
  return `m${mood}${urgeBand(urge)}${(dayIndex % GAMI_VARIANTS) + 1}`;
}

/**
 * Follow-up affordance under the reply. Mood 1 keeps the existing direct
 * support link; any real urge on other moods offers a two-minute practice.
 */
export function gamiFollowUp(
  mood: MoodLevel,
  urge: UrgeLevel | null | undefined
): 'support' | 'practice' | null {
  if (mood === 1) return 'support';
  if (urgeBand(urge) !== 'None') return 'practice';
  return null;
}

export type DashboardGamiState = 'celebrate' | 'gentle' | 'wave' | null;

/**
 * Contextual dashboard companion state, in priority order. All inputs are
 * already available client-side; `null` renders nothing (calm, no filler).
 */
export function dashboardGamiState(input: {
  missionsResolved: number;
  missionsTotal: number;
  todayMood: MoodLevel | null;
  firstVisitToday: boolean;
}): DashboardGamiState {
  if (input.missionsTotal > 0 && input.missionsResolved >= input.missionsTotal) {
    return 'celebrate';
  }
  if (input.todayMood !== null && input.todayMood <= 2) return 'gentle';
  if (input.firstVisitToday) return 'wave';
  return null;
}
