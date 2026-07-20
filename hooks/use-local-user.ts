'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { apiClient } from '@/lib/api-client';

export interface LocalUser {
  id?: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  role?: string;
  email_verified_at?: string;
  phone_e164?: string;
  phone_verified_at?: string;
  password_enabled?: boolean;
}

const STORAGE_KEY = 'gamblock_user';
const EMPTY_USER: LocalUser = {};
const listeners = new Set<() => void>();

let cachedRaw: string | null | undefined;
let cachedUser: LocalUser = EMPTY_USER;
let currentProfileRequest: Promise<LocalUser> | null = null;
let loadedForToken: string | null = null;

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

export async function refreshCurrentUser() {
  if (typeof window === 'undefined') return EMPTY_USER;
  const token = window.localStorage.getItem('gamblock_access_token');
  if (!token) return EMPTY_USER;
  if (currentProfileRequest) return currentProfileRequest;

  currentProfileRequest = apiClient<LocalUser>('/me')
    .then((profile) => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      loadedForToken = token;
      notifyLocalUserChanged();
      return profile;
    })
    .catch((err) => {
      const cached = readUser();
      if (cached.id || cached.role) {
        loadedForToken = token;
        return cached;
      }
      throw err;
    })
    .finally(() => {
      currentProfileRequest = null;
    });
  return currentProfileRequest;
}

export function updateLocalUser(
  updates: Partial<Pick<LocalUser, 'display_name' | 'avatar_url'>>
) {
  if (typeof window === 'undefined') return;
  const current = readUser();
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...current, ...updates })
  );
  notifyLocalUserChanged();
}

export function useLocalUser() {
  const user = useSyncExternalStore(subscribe, readUser, () => EMPTY_USER);

  useEffect(() => {
    const token = window.localStorage.getItem('gamblock_access_token');
    if (token && loadedForToken !== token) {
      void refreshCurrentUser();
    }
  }, []);

  return user;
}

export function useAuthoritativeUser() {
  const user = useLocalUser();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );

  useEffect(() => {
    let active = true;
    refreshCurrentUser()
      .then(() => {
        if (active) setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, []);

  return { user, status };
}
