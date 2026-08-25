'use client';

import { useCallback, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { GUEST_ROUTES, ROUTES } from '@/routes';

/**
 * Back navigation stack stored in sessionStorage so every back button shares
 * one coherent history of visited routes (pathname + full query string).
 */
const STORAGE_KEY = 'gamblock:back-navigation-stack';
const MAX_ENTRIES = 30;

const LOCALES = ['/id', '/en'] as const;

export interface BackNavigationEntry {
  pathname: string;
  search: string;
}

export interface UseBackNavigationOptions {
  /** Route used when there is no usable previous page (defaults to home). */
  fallbackHref?: string;
  /**
   * Routes that must never be used as a back target. Defaults to the guest /
   * auth flow pages so the app never routes "back" into login, registration,
   * or the verification step after the user already authenticated.
   */
  excludedRoutes?: string[];
}

export const DEFAULT_EXCLUDED_ROUTES: string[] = [
  ...GUEST_ROUTES,
  ROUTES.VERIFY_PHONE,
];

/** Strips the leading locale segment ("/id", "/en") when present. */
export function stripLocalePathname(pathname: string): string {
  for (const locale of LOCALES) {
    if (pathname === locale) return '/';
    if (pathname.startsWith(`${locale}/`)) return pathname.slice(locale.length);
  }
  return pathname;
}

/** Re-applies the active locale prefix to a route that may already carry one. */
export function prefixLocalePathname(prefix: string, pathname: string): string {
  const stripped = stripLocalePathname(pathname);
  if (!prefix) return pathname;
  if (stripped === '/') return prefix;
  return `${prefix}${stripped}`;
}

/** Extracts the active locale prefix from the current full pathname. */
export function readLocalePrefix(pathname: string): string {
  for (const locale of LOCALES) {
    if (pathname === locale || pathname.startsWith(`${locale}/`)) return locale;
  }
  return '';
}

function readStack(): BackNavigationEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as BackNavigationEntry[]) : [];
  } catch {
    return [];
  }
}

function writeStack(stack: BackNavigationEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stack));
  } catch {
    // Storage may be unavailable (private mode); back simply falls back.
  }
}

function entryKey(entry: BackNavigationEntry) {
  return `${entry.pathname}${entry.search}`;
}

function isExcluded(pathname: string, excluded: string[]) {
  return excluded.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Records the current route. Same-pathname visits with a different query
 * update the entry in place (filter-toolbar style `router.replace`) instead of
 * stacking a new entry.
 */
export function recordRoute(pathname: string, search: string) {
  if (!pathname || typeof window === 'undefined') return;
  const stack = readStack();
  const top = stack[stack.length - 1];
  if (top?.pathname === pathname) {
    if (top.search !== search) {
      top.search = search;
      writeStack(stack);
    }
    return;
  }
  stack.push({ pathname, search });
  if (stack.length > MAX_ENTRIES) {
    stack.splice(0, stack.length - MAX_ENTRIES);
  }
  writeStack(stack);
}

export interface ResolveBackResult {
  /** The previous page to route to, or null when none is usable. */
  target: BackNavigationEntry | null;
  /**
   * True when the immediately-previous page was an excluded route (for example
   * login reached right before an authenticated screen). Callers must avoid the
   * native browser-back fallback in that case so the app never bounces into it.
   */
  dodgedExcluded: boolean;
}

/**
 * Resolves the previous page to return to. Consumes the consumed tail of the
 * stack so repeated backs walk further back. Non-mutating peek lives in
 * `findBackTarget`.
 */
export function resolveBackTarget(
  current: BackNavigationEntry,
  excluded: string[]
): ResolveBackResult {
  const stack = readStack();
  const currentKeyValue = entryKey(current);

  while (stack.length && entryKey(stack[stack.length - 1]) === currentKeyValue) {
    stack.pop();
  }

  let dodgedExcluded = false;
  while (stack.length) {
    const candidate = stack[stack.length - 1];
    if (isExcluded(candidate.pathname, excluded)) {
      stack.pop();
      dodgedExcluded = true;
      continue;
    }
    writeStack(stack);
    return { target: candidate, dodgedExcluded };
  }

  writeStack(stack);
  return { target: null, dodgedExcluded };
}

/** Non-mutating lookahead used to answer `canGoBack`. */
export function findBackTarget(
  current: BackNavigationEntry,
  excluded: string[]
): BackNavigationEntry | null {
  const entries = readStack();
  const currentKeyValue = entryKey(current);
  for (let i = entries.length - 1; i >= 0; i--) {
    if (entryKey(entries[i]) === currentKeyValue) continue;
    if (isExcluded(entries[i].pathname, excluded)) continue;
    return entries[i];
  }
  return null;
}

/**
 * Reconciles the stack with native browser navigation (`popstate`). Keeps the
 * entries up to and including the current location so a later in-app back never
 * jumps *forward* into an entry the browser already left.
 */
export function syncStackOnPop(pathname: string, search: string) {
  const stack = readStack();
  const targetKey = `${pathname}${search}`;
  let matchIndex = -1;
  for (let i = stack.length - 1; i >= 0; i--) {
    if (entryKey(stack[i]) === targetKey) {
      matchIndex = i;
      break;
    }
  }
  if (matchIndex >= 0 && matchIndex < stack.length - 1) {
    writeStack(stack.slice(0, matchIndex + 1));
  }
}

/**
 * History-aware "back" navigation hook.
 *
 * 1. When a previous in-app page exists it routes there with the full query
 *    string preserved (mirrors the browser history for in-app navigation).
 * 2. When there is no tracked history but the browser has some, it falls back
 *    to the native browser back so externally-entered pages still return to
 *    their exact previous entry.
 * 3. It never routes into the excluded guest/auth flow, so after login the
 *    app does not bounce back into the login screen.
 * 4. A caller-supplied fallback target is used when nothing else is usable.
 *
 * The hook is intentionally provider-independent (plain `next/navigation`) so
 * it also works inside `global-error.tsx` / `global-not-found.tsx`, which
 * render outside the next-intl `<NextIntlClientProvider>`. The active locale is
 * derived from the current pathname and re-applied when routing back.
 *
 * Callers pass their default target either through `options.fallbackHref` or
 * as an argument to `goBack(fallbackHref)`.
 */
export function useBackNavigation(options: UseBackNavigationOptions = {}) {
  const router = useRouter();
  const fullPathname = usePathname();
  const localePrefix = readLocalePrefix(fullPathname ?? '');
  const pathname = stripLocalePathname(fullPathname ?? '');

  const { fallbackHref = ROUTES.HOME, excludedRoutes = DEFAULT_EXCLUDED_ROUTES } =
    options;

  const locationSearch =
    typeof window !== 'undefined'
      ? window.location.search.startsWith('?')
        ? window.location.search
        : window.location.search
          ? `?${window.location.search}`
          : ''
      : '';

  useEffect(() => {
    recordRoute(pathname, locationSearch);
  }, [pathname, locationSearch]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPopState = () => {
      const nextPath = stripLocalePathname(window.location.pathname ?? '');
      const nextSearch = window.location.search.startsWith('?')
        ? window.location.search
        : window.location.search
          ? `?${window.location.search}`
          : '';
      syncStackOnPop(nextPath, nextSearch);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const goBack = useCallback(
    (fallbackOverride?: string) => {
      const fallback = fallbackOverride ?? fallbackHref;
      const current: BackNavigationEntry = {
        pathname,
        search: locationSearch,
      };
      const resolved = resolveBackTarget(current, excludedRoutes);

      if (resolved.target) {
        router.push(
          prefixLocalePathname(
            localePrefix,
            `${resolved.target.pathname}${resolved.target.search}`
          )
        );
        return;
      }
      if (resolved.dodgedExcluded) {
        router.push(prefixLocalePathname(localePrefix, fallback));
        return;
      }
      if (typeof window !== 'undefined' && window.history.length > 1) {
        router.back();
        return;
      }
      router.push(prefixLocalePathname(localePrefix, fallback));
    },
    [pathname, locationSearch, router, fallbackHref, excludedRoutes, localePrefix]
  );

  const canGoBack = useCallback(() => {
    const current: BackNavigationEntry = { pathname, search: locationSearch };
    if (findBackTarget(current, excludedRoutes)) return true;
    return typeof window !== 'undefined' && window.history.length > 1;
  }, [pathname, locationSearch, excludedRoutes]);

  return { goBack, canGoBack };
}