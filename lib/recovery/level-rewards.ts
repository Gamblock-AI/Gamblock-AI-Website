import type { RecoveryRoomTheme } from '@/hooks/use-recovery-experience';

/**
 * Client-side mirror of the level reward map. Decor ids duplicate the server
 * table (`levelDecorUnlocks` in `unlock_rules.go`) purely for display; the
 * mission-claim response's `newly_unlocked` list remains authoritative for
 * the level-up moment. Poses and hero accents are pure presentation and are
 * derived from the level alone. Everything is additive and cosmetic.
 */
export interface LevelReward {
  decorIds?: readonly string[];
  /** Mascot pose asset under /images/mascot/. */
  poseAsset?: string;
  /** Semantic accent token name for the dashboard hero. */
  accent?: 'sky' | 'cyan' | 'azure' | 'sage';
  themeId?: RecoveryRoomTheme;
}

export const LEVEL_REWARDS: Record<number, LevelReward> = {
  2: { decorIds: ['poster_calm'] },
  3: { decorIds: ['mug_warm'] },
  4: { decorIds: ['rug_soft'] },
  5: { poseAsset: '/images/mascot/gami-thumbsup.webp' },
  6: { decorIds: ['bookshelf_mini'] },
  7: { accent: 'sky' },
  8: { decorIds: ['string_lights'] },
  9: { poseAsset: '/images/mascot/gami-meditate.webp' },
  10: { accent: 'cyan' },
  11: { accent: 'azure' },
  12: { decorIds: ['radio_lofi'] },
  13: { poseAsset: '/images/mascot/gami-celebrate.webp' },
  14: { accent: 'sage' },
  15: { poseAsset: '/images/mascot/gami-point.webp' },
  16: { decorIds: ['aquarium_mini'] },
  17: { poseAsset: '/images/mascot/gami-peek.webp' },
  18: { themeId: 'sunrise_study' },
};

/** Pose shown on the level-up moment: the newest pose earned at or below `level`. */
export function levelPoseAsset(level: number): string {
  let pose = '/images/mascot/gami-wave.webp';
  for (let candidate = 2; candidate <= level; candidate++) {
    const reward = LEVEL_REWARDS[candidate];
    if (reward?.poseAsset) pose = reward.poseAsset;
  }
  return pose;
}
