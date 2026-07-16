import type { WeeklyAdjustment } from '@/lib/recovery/types';

export type IntentionChoice = 'keep' | 'adjust' | 'pause';

export function getIntentionChoice(
  adjustment: WeeklyAdjustment | undefined
): IntentionChoice {
  if (adjustment === 'pause') return 'pause';
  if (adjustment === 'simplify' || adjustment === 'change_focus') {
    return 'adjust';
  }
  return 'keep';
}

export function getWeeklyAdjustment(choice: IntentionChoice): WeeklyAdjustment {
  if (choice === 'pause') return 'pause';
  if (choice === 'adjust') return 'change_focus';
  return 'continue';
}
