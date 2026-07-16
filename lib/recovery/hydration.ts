import { clearRecoveryRuntime, updateRecoveryState } from './runtime';
import { createHistoryEvent } from './date';
import type { DailyCheckIn, RecoveryIntention } from './types';

export function clearRecoveryData(): void {
  clearRecoveryRuntime();
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

    const nextCheckIns =
      state.checkIns.length === 0 && checkIns.length > 0
        ? checkIns
        : state.checkIns;

    return {
      ...state,
      intentions: nextIntentions,
      intentionHistory: nextHistory,
      checkIns: nextCheckIns,
    };
  });
}
