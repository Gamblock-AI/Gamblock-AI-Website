import {
  LEGACY_STORAGE_KEYS,
  RECOVERY_STORAGE_KEY,
  recoveryLimits,
} from './constants';
import {
  createEmptyRecoveryState,
  createHistoryEvent,
  createId,
  focusPeriodFromDays,
} from './date';
import { parseRecoveryState } from './schema';
import type {
  RecoveryIntention,
  RecoveryPersistence,
  RecoveryState,
} from './types';
import { normalizeText } from './validation';

const SERVER_SNAPSHOT: RecoveryState = createEmptyRecoveryState();
const listeners = new Set<() => void>();

let persistence: RecoveryPersistence = 'memory';
let currentState =
  typeof window === 'undefined' ? SERVER_SNAPSHOT : loadInitialClientState();
let listeningForStorage = false;

export function getRecoverySnapshot(): RecoveryState {
  return currentState;
}

export function getRecoveryServerSnapshot(): RecoveryState {
  return SERVER_SNAPSHOT;
}

export function getRecoveryPersistence(): RecoveryPersistence {
  return persistence;
}

export function getRecoveryPersistenceServerSnapshot(): RecoveryPersistence {
  return 'memory';
}

export function subscribeRecoveryStore(listener: () => void): () => void {
  listeners.add(listener);

  if (
    typeof window !== 'undefined' &&
    !listeningForStorage &&
    listeners.size === 1
  ) {
    window.addEventListener('storage', handleStorageEvent);
    listeningForStorage = true;
  }

  return () => {
    listeners.delete(listener);
    if (
      typeof window !== 'undefined' &&
      listeningForStorage &&
      listeners.size === 0
    ) {
      window.removeEventListener('storage', handleStorageEvent);
      listeningForStorage = false;
    }
  };
}

export function updateRecoveryState(
  updater: (state: RecoveryState) => RecoveryState
): void {
  const nextState = updater(currentState);
  if (nextState === currentState) return;

  currentState = nextState;
  persistCurrentState();
  emitChange();
}

export function clearRecoveryRuntime(): void {
  currentState = createEmptyRecoveryState();

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(RECOVERY_STORAGE_KEY);
      for (const key of LEGACY_STORAGE_KEYS) {
        window.localStorage.removeItem(key);
      }
      persistence = 'local';
    } catch {
      persistence = 'memory';
    }
  }

  emitChange();
}

export function reportSyncFailure(category: 'intentions' | 'checkIns'): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('gamblock:recovery-sync-error', { detail: { category } })
  );
}

function persistCurrentState(): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      RECOVERY_STORAGE_KEY,
      JSON.stringify(currentState)
    );
    persistence = 'local';
  } catch {
    persistence = 'memory';
  }
}

function loadInitialClientState(): RecoveryState {
  try {
    persistence = 'local';
    const stored = window.localStorage.getItem(RECOVERY_STORAGE_KEY);
    if (stored) {
      return parseRecoveryState(stored) ?? createEmptyRecoveryState();
    }

    const legacyIntention = normalizeText(
      window.localStorage.getItem('gamblock_intention'),
      recoveryLimits.intentionLength
    );
    if (!legacyIntention) return createEmptyRecoveryState();

    const now = new Date().toISOString();
    const targetDays = Number(
      window.localStorage.getItem('gamblock_target_days')
    );
    const intention: RecoveryIntention = {
      id: createId('int'),
      title: legacyIntention,
      nextAction: '',
      focusPeriod: focusPeriodFromDays(targetDays),
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    const migrated: RecoveryState = {
      ...createEmptyRecoveryState(),
      intentions: [intention],
      intentionHistory: [createHistoryEvent(intention.id, 'created', now)],
    };

    window.localStorage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(migrated));
    for (const key of LEGACY_STORAGE_KEYS) {
      window.localStorage.removeItem(key);
    }
    return migrated;
  } catch {
    persistence = 'memory';
    return createEmptyRecoveryState();
  }
}

function handleStorageEvent(event: StorageEvent): void {
  if (event.key !== RECOVERY_STORAGE_KEY) return;

  if (event.newValue === null) {
    currentState = createEmptyRecoveryState();
  } else {
    const nextState = parseRecoveryState(event.newValue);
    if (!nextState) return;
    currentState = nextState;
  }

  persistence = 'local';
  emitChange();
}

function emitChange(): void {
  for (const listener of listeners) listener();
}
