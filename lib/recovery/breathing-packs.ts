/**
 * Selectable breathing patterns for the timed practices. Each pack is a fixed
 * phase list; the wave animation and phase cue derive everything from these
 * numbers, so packs stay pure data. The physiological sigh is modeled as two
 * inhales (a full breath plus a short top-up) and one long exhale.
 */
export type BreathingPackId = 'box' | 'relax478' | 'sigh';

export interface BreathingPhase {
  key: 'inhale' | 'hold' | 'exhale';
  seconds: number;
}

export const BREATHING_PACKS: Record<BreathingPackId, readonly BreathingPhase[]> = {
  box: [
    { key: 'inhale', seconds: 4 },
    { key: 'hold', seconds: 4 },
    { key: 'exhale', seconds: 4 },
    { key: 'hold', seconds: 4 },
  ],
  relax478: [
    { key: 'inhale', seconds: 4 },
    { key: 'hold', seconds: 7 },
    { key: 'exhale', seconds: 8 },
  ],
  sigh: [
    { key: 'inhale', seconds: 2 },
    { key: 'inhale', seconds: 1 },
    { key: 'exhale', seconds: 6 },
  ],
};

export const BREATHING_PACK_IDS: readonly BreathingPackId[] = [
  'box',
  'relax478',
  'sigh',
];

export function packCycleSeconds(pack: readonly BreathingPhase[]): number {
  return pack.reduce((total, phase) => total + phase.seconds, 0);
}

/** Phase index at `position` seconds into the cycle. */
export function phaseIndexAt(
  pack: readonly BreathingPhase[],
  position: number
): number {
  let accumulated = 0;
  for (let index = 0; index < pack.length; index++) {
    accumulated += pack[index].seconds;
    if (position < accumulated) return index;
  }
  return pack.length - 1;
}

/** Whether the lungs are expanded at the given phase (holds keep the previous state). */
export function isExpandedAt(
  pack: readonly BreathingPhase[],
  phaseIndex: number
): boolean {
  let expanded = false;
  for (let index = 0; index <= phaseIndex && index < pack.length; index++) {
    if (pack[index].key === 'inhale') expanded = true;
    else if (pack[index].key === 'exhale') expanded = false;
  }
  return expanded;
}
