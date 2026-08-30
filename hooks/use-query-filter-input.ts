'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/routing';
import {
  filterQueryKey,
  LEGACY_DASHBOARD_QUERY_KEYS,
  mergeQueryKeys,
  normalizeQueryParams,
  updateQueryURL,
} from '@/lib/query-params';

interface DraftValue {
  value: string;
  baseValue: string;
}

export interface UseQueryFilterInputOptions {
  resourceKey: string;
  field?: string;
  pageKey?: string;
  debounceMs?: number;
  removeKeys?: readonly string[];
}

export function useQueryFilterInput({
  resourceKey,
  field = 'q',
  pageKey,
  debounceMs = 350,
  removeKeys = [],
}: UseQueryFilterInputOptions) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const queryKey = filterQueryKey(resourceKey, field);
  const searchParamsString = searchParams.toString();
  const normalizedSearchParams = useMemo(
    () => normalizeQueryParams(searchParamsString),
    [searchParamsString]
  );
  const canonicalValue = normalizedSearchParams.get(queryKey) ?? '';
  const cleanupKeys = useMemo(
    () => mergeQueryKeys(LEGACY_DASHBOARD_QUERY_KEYS, removeKeys),
    [removeKeys]
  );
  const [draft, setDraft] = useState<DraftValue | null>(null);
  const timerRef = useRef<number | null>(null);
  const latestSearchParamsRef = useRef(normalizedSearchParams);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const commit = useCallback(
    (value: string) => {
      const trimmedValue = value.trim();
      const remove = pageKey ? [pageKey, ...cleanupKeys] : cleanupKeys;
      router.replace(
        updateQueryURL(
          pathname,
          latestSearchParamsRef.current,
          { [queryKey]: trimmedValue || null },
          remove
        ),
        { scroll: false }
      );
      setDraft(null);
    },
    [cleanupKeys, pageKey, pathname, queryKey, router]
  );

  const onChange = useCallback(
    (value: string) => {
      clearTimer();
      setDraft({ value, baseValue: canonicalValue });
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        commit(value);
      }, debounceMs);
    },
    [canonicalValue, clearTimer, commit, debounceMs]
  );

  const reset = useCallback(() => {
    clearTimer();
    setDraft(null);
    commit('');
  }, [clearTimer, commit]);

  useEffect(() => clearTimer, [clearTimer]);
  useEffect(() => {
    latestSearchParamsRef.current = normalizedSearchParams;
  }, [normalizedSearchParams]);

  return {
    value:
      draft && canonicalValue === draft.baseValue
        ? draft.value
        : canonicalValue,
    onChange,
    reset,
    queryKey,
  };
}
