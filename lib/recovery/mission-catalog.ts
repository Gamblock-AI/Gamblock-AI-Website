import type { MissionNumber } from './types';

export type MissionId = `mission_${MissionNumber}`;

export interface MissionCatalogItem {
  number: MissionNumber;
  id: MissionId;
  titleKey: `recovery.missions.${MissionId}.title`;
  descriptionKey: `recovery.missions.${MissionId}.description`;
}

/**
 * Stable identifiers for the backend's five boolean mission slots. User-facing
 * copy belongs in the locale catalog rather than the API contract.
 */
export const DAILY_MISSION_CATALOG: readonly MissionCatalogItem[] = [
  {
    number: 1,
    id: 'mission_1',
    titleKey: 'recovery.missions.mission_1.title',
    descriptionKey: 'recovery.missions.mission_1.description',
  },
  {
    number: 2,
    id: 'mission_2',
    titleKey: 'recovery.missions.mission_2.title',
    descriptionKey: 'recovery.missions.mission_2.description',
  },
  {
    number: 3,
    id: 'mission_3',
    titleKey: 'recovery.missions.mission_3.title',
    descriptionKey: 'recovery.missions.mission_3.description',
  },
  {
    number: 4,
    id: 'mission_4',
    titleKey: 'recovery.missions.mission_4.title',
    descriptionKey: 'recovery.missions.mission_4.description',
  },
  {
    number: 5,
    id: 'mission_5',
    titleKey: 'recovery.missions.mission_5.title',
    descriptionKey: 'recovery.missions.mission_5.description',
  },
] as const;
