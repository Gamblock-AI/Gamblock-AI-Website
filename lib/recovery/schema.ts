import { recoveryLimits } from './constants';
import {
  isDateString,
  isFocusPeriod,
  isIntentionEventType,
  isIntentionStatus,
  isMissionNumber,
  isMoodLevel,
  isRecord,
  isSkillId,
  isTimestamp,
  isUrgeLevel,
  isWeeklyAdjustment,
  isWeeklyHelpfulAction,
  isWeeklyOutcome,
  normalizeText,
  readId,
} from './validation';
import {
  RECOVERY_STORAGE_VERSION,
  type DailyCheckIn,
  type IntentionHistoryEvent,
  type RecoveryIntention,
  type RecoveryState,
  type SelectedMissionAlternative,
  type WeeklyReview,
} from './types';

export function parseRecoveryState(raw: string): RecoveryState | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || value.version !== RECOVERY_STORAGE_VERSION) {
      return null;
    }

    return {
      version: RECOVERY_STORAGE_VERSION,
      intentions: ensureSingleActiveIntention(
        readIntentions(value.intentions)
      ).slice(0, recoveryLimits.intentions),
      intentionHistory: readIntentionHistory(value.intentionHistory).slice(
        0,
        recoveryLimits.intentionEvents
      ),
      checkIns: readCheckIns(value.checkIns).slice(0, recoveryLimits.checkIns),
      selectedMissions: readSelectedMissions(value.selectedMissions).slice(
        0,
        recoveryLimits.selectedMissions
      ),
      weeklyReviews: readWeeklyReviews(value.weeklyReviews).slice(
        0,
        recoveryLimits.weeklyReviews
      ),
    };
  } catch {
    return null;
  }
}

function readIntentions(value: unknown): RecoveryIntention[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): RecoveryIntention[] => {
    if (!isRecord(entry)) return [];
    const id = readId(entry.id);
    const title = normalizeText(entry.title, recoveryLimits.intentionLength);
    const nextAction = normalizeText(
      entry.nextAction,
      recoveryLimits.nextActionLength
    );
    if (
      !id ||
      !title ||
      !isFocusPeriod(entry.focusPeriod) ||
      !isIntentionStatus(entry.status) ||
      !isTimestamp(entry.createdAt) ||
      !isTimestamp(entry.updatedAt)
    ) {
      return [];
    }

    return [
      {
        id,
        title,
        nextAction,
        focusPeriod: entry.focusPeriod,
        status: entry.status,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      },
    ];
  });
}

function readIntentionHistory(value: unknown): IntentionHistoryEvent[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): IntentionHistoryEvent[] => {
    if (!isRecord(entry)) return [];
    const id = readId(entry.id);
    const intentionId = readId(entry.intentionId);
    if (
      !id ||
      !intentionId ||
      !isIntentionEventType(entry.type) ||
      !isTimestamp(entry.occurredAt)
    ) {
      return [];
    }

    return [
      {
        id,
        intentionId,
        type: entry.type,
        occurredAt: entry.occurredAt,
      },
    ];
  });
}

function ensureSingleActiveIntention(
  intentions: RecoveryIntention[]
): RecoveryIntention[] {
  let activeFound = false;

  return intentions.map((intention) => {
    if (intention.status !== 'active') return intention;
    if (!activeFound) {
      activeFound = true;
      return intention;
    }
    return { ...intention, status: 'paused' };
  });
}

function readCheckIns(value: unknown): DailyCheckIn[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): DailyCheckIn[] => {
    if (!isRecord(entry)) return [];
    const id = readId(entry.id);
    if (
      !id ||
      !isDateString(entry.date) ||
      !isMoodLevel(entry.mood) ||
      (entry.urge !== null && !isUrgeLevel(entry.urge)) ||
      !isTimestamp(entry.recordedAt)
    ) {
      return [];
    }

    return [
      {
        id,
        date: entry.date,
        mood: entry.mood,
        urge: entry.urge,
        recordedAt: entry.recordedAt,
      },
    ];
  });
}

function readSelectedMissions(value: unknown): SelectedMissionAlternative[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): SelectedMissionAlternative[] => {
    if (
      !isRecord(entry) ||
      !isDateString(entry.date) ||
      !isMissionNumber(entry.missionNumber) ||
      !isTimestamp(entry.selectedAt)
    ) {
      return [];
    }

    return [
      {
        date: entry.date,
        missionNumber: entry.missionNumber,
        selectedAt: entry.selectedAt,
      },
    ];
  });
}

function readWeeklyReviews(value: unknown): WeeklyReview[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): WeeklyReview[] => {
    if (!isRecord(entry)) return [];
    const id = readId(entry.id);
    const intentionId =
      entry.intentionId === null ? null : readId(entry.intentionId);
    const nextMissionNumber =
      entry.nextMissionNumber === null ? null : entry.nextMissionNumber;
    const selectedSkillId =
      entry.selectedSkillId === null ? null : entry.selectedSkillId;

    if (
      !id ||
      !isDateString(entry.weekStart) ||
      (entry.intentionId !== null && !intentionId) ||
      (entry.outcome !== null && !isWeeklyOutcome(entry.outcome)) ||
      !isWeeklyHelpfulAction(entry.helpfulAction) ||
      !isWeeklyAdjustment(entry.adjustment) ||
      (nextMissionNumber !== null && !isMissionNumber(nextMissionNumber)) ||
      (selectedSkillId !== null && !isSkillId(selectedSkillId)) ||
      !isTimestamp(entry.reviewedAt)
    ) {
      return [];
    }

    return [
      {
        id,
        weekStart: entry.weekStart,
        intentionId,
        outcome: entry.outcome,
        helpfulAction: entry.helpfulAction,
        adjustment: entry.adjustment,
        nextMissionNumber,
        selectedSkillId,
        reviewedAt: entry.reviewedAt,
      },
    ];
  });
}
