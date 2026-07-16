import {
  recoveryLimits,
  skillIds,
  weeklyAdjustments,
  weeklyHelpfulActions,
  weeklyOutcomes,
} from './constants';
import { createId, getLocalWeekStartString } from './date';
import { updateRecoveryState } from './runtime';
import type { SaveWeeklyReviewInput, WeeklyReview } from './types';
import { isDateString, isMissionNumber } from './validation';

export function saveWeeklyReview(
  input: SaveWeeklyReviewInput
): WeeklyReview | null {
  if (
    (input.outcome !== undefined &&
      input.outcome !== null &&
      !weeklyOutcomes.has(input.outcome)) ||
    !weeklyHelpfulActions.has(input.helpfulAction) ||
    !weeklyAdjustments.has(input.adjustment)
  ) {
    return null;
  }
  if (
    input.nextMissionNumber !== undefined &&
    input.nextMissionNumber !== null &&
    !isMissionNumber(input.nextMissionNumber)
  ) {
    return null;
  }
  if (
    input.selectedSkillId !== undefined &&
    input.selectedSkillId !== null &&
    !skillIds.has(input.selectedSkillId)
  ) {
    return null;
  }

  const weekStart = isDateString(input.weekStart)
    ? input.weekStart
    : getLocalWeekStartString();
  const now = new Date().toISOString();
  let savedReview: WeeklyReview | null = null;

  updateRecoveryState((state) => {
    const existing = state.weeklyReviews.find(
      (review) => review.weekStart === weekStart
    );
    const activeIntention = state.intentions.find(
      (intention) => intention.status === 'active'
    );
    const requestedIntentionId = input.intentionId;
    let intentionId = activeIntention?.id ?? null;
    if (requestedIntentionId === null) {
      intentionId = null;
    } else if (
      requestedIntentionId !== undefined &&
      state.intentions.some(
        (intention) => intention.id === requestedIntentionId
      )
    ) {
      intentionId = requestedIntentionId;
    }

    const nextReview: WeeklyReview = {
      id: existing?.id ?? createId('review'),
      weekStart,
      intentionId,
      outcome: input.outcome ?? null,
      helpfulAction: input.helpfulAction,
      adjustment: input.adjustment,
      nextMissionNumber: input.nextMissionNumber ?? null,
      selectedSkillId: input.selectedSkillId ?? null,
      reviewedAt: now,
    };
    savedReview = nextReview;

    return {
      ...state,
      weeklyReviews: [
        nextReview,
        ...state.weeklyReviews.filter(
          (review) => review.weekStart !== weekStart
        ),
      ].slice(0, recoveryLimits.weeklyReviews),
    };
  });

  return savedReview;
}
