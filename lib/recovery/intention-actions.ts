import { apiClient } from '@/lib/api-client';
import { recoveryLimits } from './constants';
import { createHistoryEvent, createId } from './date';
import { reportSyncFailure, updateRecoveryState } from './runtime';
import { isRecoverySyncEnabled } from './sync-preferences';
import type {
  CreateIntentionInput,
  IntentionHistoryEvent,
  IntentionHistoryEventType,
  IntentionStatus,
  RecoveryIntention,
  UpdateIntentionInput,
} from './types';
import { isFocusPeriod, isIntentionStatus, normalizeText } from './validation';

export function createIntention(
  input: CreateIntentionInput
): RecoveryIntention | null {
  const title = normalizeText(input.title, recoveryLimits.intentionLength);
  if (!title) return null;

  const now = new Date().toISOString();
  const intention: RecoveryIntention = {
    id: createId('int'),
    title,
    nextAction: normalizeText(
      input.nextAction,
      recoveryLimits.nextActionLength
    ),
    focusPeriod: isFocusPeriod(input.focusPeriod)
      ? input.focusPeriod
      : 'this_week',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  updateRecoveryState((state) => {
    const pausedIntentions: IntentionHistoryEvent[] = [];
    const intentions = state.intentions.map((existing) => {
      if (existing.status !== 'active') return existing;
      pausedIntentions.push(createHistoryEvent(existing.id, 'paused', now));
      return { ...existing, status: 'paused' as const, updatedAt: now };
    });

    return {
      ...state,
      intentions: [intention, ...intentions].slice(
        0,
        recoveryLimits.intentions
      ),
      intentionHistory: [
        createHistoryEvent(intention.id, 'created', now),
        ...pausedIntentions,
        ...state.intentionHistory,
      ].slice(0, recoveryLimits.intentionEvents),
    };
  });

  syncIntention(intention);
  return intention;
}

export function updateIntention(
  intentionId: string,
  input: UpdateIntentionInput
): RecoveryIntention | null {
  let updatedIntention: RecoveryIntention | null = null;

  updateRecoveryState((state) => {
    const existing = state.intentions.find(
      (intention) => intention.id === intentionId
    );
    if (!existing) return state;

    const title =
      input.title === undefined
        ? existing.title
        : normalizeText(input.title, recoveryLimits.intentionLength);
    if (!title) return state;

    const nextAction =
      input.nextAction === undefined
        ? existing.nextAction
        : normalizeText(input.nextAction, recoveryLimits.nextActionLength);
    const focusPeriod = isFocusPeriod(input.focusPeriod)
      ? input.focusPeriod
      : existing.focusPeriod;

    if (
      title === existing.title &&
      nextAction === existing.nextAction &&
      focusPeriod === existing.focusPeriod
    ) {
      updatedIntention = existing;
      return state;
    }

    const now = new Date().toISOString();
    const nextIntention: RecoveryIntention = {
      ...existing,
      title,
      nextAction,
      focusPeriod,
      updatedAt: now,
    };
    updatedIntention = nextIntention;

    return {
      ...state,
      intentions: state.intentions.map((intention) =>
        intention.id === intentionId ? nextIntention : intention
      ),
      intentionHistory: [
        createHistoryEvent(intentionId, 'updated', now),
        ...state.intentionHistory,
      ].slice(0, recoveryLimits.intentionEvents),
    };
  });

  if (updatedIntention) syncIntention(updatedIntention);
  return updatedIntention;
}

export function setIntentionStatus(
  intentionId: string,
  status: IntentionStatus
): RecoveryIntention | null {
  if (!isIntentionStatus(status)) return null;

  let updatedIntention: RecoveryIntention | null = null;

  updateRecoveryState((state) => {
    const existing = state.intentions.find(
      (intention) => intention.id === intentionId
    );
    if (!existing) return state;
    if (existing.status === status) {
      updatedIntention = existing;
      return state;
    }

    const now = new Date().toISOString();
    const additionalEvents: IntentionHistoryEvent[] = [];
    const intentions = state.intentions.map((intention) => {
      if (intention.id === intentionId) {
        updatedIntention = { ...intention, status, updatedAt: now };
        return updatedIntention;
      }
      if (status === 'active' && intention.status === 'active') {
        additionalEvents.push(createHistoryEvent(intention.id, 'paused', now));
        return { ...intention, status: 'paused' as const, updatedAt: now };
      }
      return intention;
    });

    const eventType: IntentionHistoryEventType =
      status === 'active' ? 'resumed' : status;

    return {
      ...state,
      intentions,
      intentionHistory: [
        createHistoryEvent(intentionId, eventType, now),
        ...additionalEvents,
        ...state.intentionHistory,
      ].slice(0, recoveryLimits.intentionEvents),
    };
  });

  if (updatedIntention) syncIntention(updatedIntention);
  return updatedIntention;
}

function syncIntention(intention: RecoveryIntention): void {
  if (!isRecoverySyncEnabled('intentions')) return;

  void apiClient('/intentions', {
    method: 'POST',
    body: JSON.stringify({
      intention_text: intention.title,
      status: intention.status,
    }),
  }).catch(() => reportSyncFailure('intentions'));
}
