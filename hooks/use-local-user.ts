'use client';

import { useSyncExternalStore } from 'react';

export interface LocalUser {
  id?: string;
  email?: string;
  display_name?: string;
  role?: string;
}

const STORAGE_KEY = 'gamblock_user';
const EMPTY_USER: LocalUser = {};
const listeners = new Set<() => void>();

let cachedRaw: string | null | undefined;
let cachedUser: LocalUser = EMPTY_USER;

function readUser(): LocalUser {
  if (typeof window === 'undefined') return EMPTY_USER;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedUser;

  cachedRaw = raw;
  if (!raw) {
    cachedUser = EMPTY_USER;
    return cachedUser;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    cachedUser =
      parsed && typeof parsed === 'object' ? (parsed as LocalUser) : EMPTY_USER;
  } catch {
    cachedUser = EMPTY_USER;
  }

  return cachedUser;
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function notifyLocalUserChanged() {
  cachedRaw = undefined;
  listeners.forEach((listener) => listener());
}

export function updateLocalUser(updates: Pick<LocalUser, 'display_name'>) {
  if (typeof window === 'undefined') return;
  const current = readUser();
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...current, ...updates }),
  );
  notifyLocalUserChanged();
}

export function useLocalUser() {
  return useSyncExternalStore(subscribe, readUser, () => EMPTY_USER);
}
