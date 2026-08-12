import {
  ENGAGEMENT_STORAGE_KEYS,
  LEGACY_STORAGE_KEYS,
  recoveryLimits,
  recoveryStorageKeyFor,
} from './constants';
import {
  createEmptyRecoveryState,
  createHistoryEvent,
  createId,
  focusPeriodFromDays,
} from './date';
import { readStoredUser } from '@/hooks/use-local-user';
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
let currentAccountId =
  typeof window === 'undefined' ? '' : resolveAccountId();
let currentState =
  typeof window === 'undefined' ? SERVER_SNAPSHOT : loadInitialClientState();
let listeningForStorage = false;

/** Resolve the authenticated account id from the stored profile. */
function resolveAccountId(): string {
  return readStoredUser().id ?? '';
}

/** Storage key scoped to the active account; falls back to the base key. */
function activeStorageKey(): string {
  return recoveryStorageKeyFor(currentAccountId);
}

/**
 * Re-scope the store when the authenticated account changes (same-tab login
 * switch or stale module state). Reloads from the account-specific key and
 * notifies subscribers so a fresh account starts with an empty store.
 */
export function ensureRecoveryAccount(): void {
  const next = resolveAccountId();
  if (next === currentAccountId) return;
  currentAccountId = next;
  currentState = loadInitialClientState();
  emitChange();
}

/** Explicit React trigger so account switches re-scope before hydration. */
export function refreshRecoveryAccount(): void {
  ensureRecoveryAccount();
}

export function getRecoverySnapshot(): RecoveryState {
  ensureRecoveryAccount();
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
  ensureRecoveryAccount();
  const nextState = updater(currentState);
  if (nextState === currentState) return;

  currentState = nextState;
  persistCurrentState();
  emitChange();
}

export function clearRecoveryRuntime(): void {
  ensureRecoveryAccount();
  currentState = createEmptyRecoveryState();

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(activeStorageKey());
      for (const key of LEGACY_STORAGE_KEYS) {
        window.localStorage.removeItem(key);
      }
      for (const key of ENGAGEMENT_STORAGE_KEYS) {
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
      activeStorageKey(),
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
    const stored = window.localStorage.getItem(activeStorageKey());
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

    window.localStorage.setItem(activeStorageKey(), JSON.stringify(migrated));
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
  if (event.key !== activeStorageKey()) return;

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
