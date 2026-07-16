export type RecoverySyncCategory = 'intentions' | 'checkIns';

export interface RecoverySyncPreferences {
  intentions: boolean;
  checkIns: boolean;
}

const STORAGE_KEY = 'gamblock:recovery-sync:v1';
const DEFAULT_PREFERENCES: RecoverySyncPreferences = {
  intentions: false,
  checkIns: false,
};

export function getRecoverySyncPreferences(): RecoverySyncPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<RecoverySyncPreferences>;
    return {
      intentions: parsed.intentions === true,
      checkIns: parsed.checkIns === true,
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
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('gamblock:recovery-sync-changed'));
}

export function isRecoverySyncEnabled(category: RecoverySyncCategory) {
  return getRecoverySyncPreferences()[category];
}
