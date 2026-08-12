import { readStoredUser } from '@/hooks/use-local-user';

export type RecoverySyncCategory = 'intentions';

export interface RecoverySyncPreferences {
  intentions: boolean;
}

const BASE_STORAGE_KEY = 'gamblock:recovery-sync:v1';
const DEFAULT_PREFERENCES: RecoverySyncPreferences = {
  intentions: false,
};

/** Per-account sync preferences so an account switch never inherits toggles. */
function storageKey(): string {
  const accountId = readStoredUser().id ?? '';
  return accountId ? `${BASE_STORAGE_KEY}:${accountId}` : BASE_STORAGE_KEY;
}

export function getRecoverySyncPreferences(): RecoverySyncPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(storageKey());
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<RecoverySyncPreferences>;
    return {
      intentions: parsed.intentions === true,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function setRecoverySyncPreference(
  category: RecoverySyncCategory,
  enabled: boolean
) {
  if (typeof window === 'undefined') return;
  const next = { ...getRecoverySyncPreferences(), [category]: enabled };
  window.localStorage.setItem(storageKey(), JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('gamblock:recovery-sync-changed'));
}

export function isRecoverySyncEnabled(category: RecoverySyncCategory) {
  return getRecoverySyncPreferences()[category];
}
