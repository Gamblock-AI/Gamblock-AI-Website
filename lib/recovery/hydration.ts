import { recoveryLimits } from './constants';
import { clearRecoveryRuntime, updateRecoveryState } from './runtime';
import { createHistoryEvent } from './date';
import type { DailyCheckIn, RecoveryIntention } from './types';

export function clearRecoveryData(): void {
  clearRecoveryRuntime();
}

/** Server check-ins win per local date; local-only rows are kept for dates the server has not returned. */
function mergeCheckIns(
  local: DailyCheckIn[],
  server: DailyCheckIn[]
): DailyCheckIn[] {
  const byDate = new Map<string, DailyCheckIn>();
  for (const item of local) byDate.set(item.date, item);
  for (const item of server) byDate.set(item.date, item);
  return Array.from(byDate.values())
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, recoveryLimits.checkIns);
}

export function hydrateFromServer(
  intentions: RecoveryIntention[],
  checkIns: DailyCheckIn[]
): void {
  updateRecoveryState((state) => {
    let nextIntentions = state.intentions;
    let nextHistory = state.intentionHistory;
    if (state.intentions.length === 0 && intentions.length > 0) {
      nextIntentions = intentions;
      nextHistory = intentions.map((intention) =>
        createHistoryEvent(intention.id, 'created', intention.createdAt)
      );
    }

    const nextCheckIns = mergeCheckIns(state.checkIns, checkIns);

    return {
      ...state,
      intentions: nextIntentions,
      intentionHistory: nextHistory,
      checkIns: nextCheckIns,
    };
  });
}
