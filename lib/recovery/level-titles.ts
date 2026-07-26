/**
 * Deterministic journey-title tiers shared verbatim with the Flutter client
 * (`levelTitle1..7` in both catalogs). Non-competitive: titles only ever move
 * forward with the account's level and carry no comparison to anyone else.
 */
const LEVEL_TIERS = [
  { minLevel: 18, key: 'levelTitle7' },
  { minLevel: 14, key: 'levelTitle6' },
  { minLevel: 10, key: 'levelTitle5' },
  { minLevel: 7, key: 'levelTitle4' },
  { minLevel: 4, key: 'levelTitle3' },
  { minLevel: 2, key: 'levelTitle2' },
  { minLevel: 1, key: 'levelTitle1' },
] as const;

export type LevelTitleKey = (typeof LEVEL_TIERS)[number]['key'];

export function getLevelTitleKey(level: number): LevelTitleKey {
  const tier = LEVEL_TIERS.find((entry) => level >= entry.minLevel);
  return tier?.key ?? 'levelTitle1';
}
