import type { MissionNumber } from './types';

export type MissionId = `mission_${MissionNumber}`;

export interface MissionCatalogItem {
  number: MissionNumber;
  id: MissionId;
}

/**
 * Stable identifiers for the backend's six mission slots. User-facing copy
 * lives in the locale catalog (`recoveryDashboard.mission{N}` keys), never in
 * the API contract.
 */
export const DAILY_MISSION_CATALOG: readonly MissionCatalogItem[] = [
  { number: 1, id: 'mission_1' },
  { number: 2, id: 'mission_2' },
  { number: 3, id: 'mission_3' },
  { number: 4, id: 'mission_4' },
  { number: 5, id: 'mission_5' },
  { number: 6, id: 'mission_6' },
] as const;
