'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/routing';
import {
  filterQueryKey,
  LEGACY_DASHBOARD_QUERY_KEYS,
  mergeQueryKeys,
  normalizeQueryParams,
  updateQueryURL,
} from '@/lib/query-params';

export interface UseQueryFiltersOptions {
  /** Resource namespace used for canonical browser keys. */
  resourceKey: string;
  /** Semantic filter fields monitored for active filter count and state. */
  filterKeys: readonly string[];
  /** Default values for specific keys (e.g. { status: 'all', priority: 'all' }) */
  defaultValues?: Readonly<Record<string, string>>;
  /** Alias for defaultValues */
  defaultFilters?: Readonly<Record<string, string>>;
  /** Optional pathname override */
  pathname?: string;
  /** Key for pagination reset, e.g. 'page'. When set, updating a filter will reset this key to 1. */
  pageKey?: string;
  /** Flat keys from the pre-namespace URL contract to remove without reading. */
  removeKeys?: readonly string[];
}

export function useQueryFilters(options: UseQueryFiltersOptions) {
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const normalizedSearchParams = useMemo(
    () => normalizeQueryParams(searchParamsString),
    [searchParamsString]
  );
  const routingPathname = usePathname();
  const router = useRouter();

  const {
    resourceKey,
    filterKeys,
    defaultValues = {},
    defaultFilters = {},
    pathname: customPathname,
    pageKey,
    removeKeys = [],
  } = options;

  const mergedDefaults = useMemo(
    () => ({ ...defaultFilters, ...defaultValues }),
    [defaultFilters, defaultValues]
  );
  const pathname = customPathname ?? routingPathname;
  const cleanupKeys = useMemo(
    () => mergeQueryKeys(LEGACY_DASHBOARD_QUERY_KEYS, removeKeys),
    [removeKeys]
  );
  const keyFor = useCallback(
    (field: string) => filterQueryKey(resourceKey, field),
    [resourceKey]
  );

  const canonicalKeys = useMemo(
    () => new Map(filterKeys.map((field) => [field, keyFor(field)])),
    [filterKeys, keyFor]
  );

  useEffect(() => {
    if (cleanupKeys.some((key) => normalizedSearchParams.has(key))) {
      router.replace(
        updateQueryURL(pathname, normalizedSearchParams, {}, cleanupKeys),
        { scroll: false }
      );
    }
  }, [cleanupKeys, normalizedSearchParams, pathname, router]);

  // Read filter value safely
  const getFilter = useCallback(
    (key: string, fallback?: string): string => {
      const value = normalizedSearchParams.get(keyFor(key));
      if (value !== null && value !== '') {
        return value;
      }
      if (fallback !== undefined) {
        return fallback;
      }
      return mergedDefaults[key] ?? '';
    },
    [keyFor, mergedDefaults, normalizedSearchParams]
  );

  // Check if a specific filter has an active, non-default value
  const isFilterActive = useCallback(
    (key: string): boolean => {
      const val = normalizedSearchParams.get(keyFor(key));
      if (!val || val === '' || val === 'all') {
        return false;
      }
      const defaultVal = mergedDefaults[key];
      if (defaultVal !== undefined && val === defaultVal) {
        return false;
      }
      return true;
    },
    [keyFor, mergedDefaults, normalizedSearchParams]
  );

  // Determine active keys and count
  const activeKeys = useMemo(() => {
    const keys: string[] = [];
    for (const key of filterKeys) {
      const val = normalizedSearchParams.get(canonicalKeys.get(key) ?? key);
      if (val && val !== '' && val !== 'all' && val !== mergedDefaults[key]) {
        keys.push(key);
      }
    }
    return keys;
  }, [canonicalKeys, filterKeys, mergedDefaults, normalizedSearchParams]);

  const hasActiveFilters = activeKeys.length > 0;
  const activeFilterCount = activeKeys.length;

  // Collapsible toggle state (defaults to open if URL has active filters, else closed)
  const [isExpanded, setIsExpanded] = useState(() => hasActiveFilters);

  // Update a single filter key
  const setFilter = useCallback(
    (key: string, value: string | null | undefined, resetPage = true) => {
      const queryKey = keyFor(key);
      const defaultVal = mergedDefaults[key];

      const nextValue =
        value === null ||
        value === undefined ||
        value === '' ||
        value === 'all' ||
        (defaultVal !== undefined && value === defaultVal)
          ? null
          : value;
      router.replace(
        updateQueryURL(
          pathname,
          normalizedSearchParams,
          { [queryKey]: nextValue },
          resetPage && pageKey ? [pageKey, ...cleanupKeys] : cleanupKeys
        ),
        { scroll: false }
      );
    },
    [
      cleanupKeys,
      keyFor,
      normalizedSearchParams,
      pathname,
      router,
      mergedDefaults,
      pageKey,
    ]
  );

  // Update multiple filters at once
  const setFilters = useCallback(
    (
      updates: Record<string, string | null | undefined>,
      resetPage = true
    ) => {
      const queryUpdates: Record<string, string | null> = {};

      for (const [key, value] of Object.entries(updates)) {
        const defaultVal = mergedDefaults[key];
        if (
          value === null ||
          value === undefined ||
          value === '' ||
          value === 'all' ||
          (defaultVal !== undefined && value === defaultVal)
        ) {
          queryUpdates[keyFor(key)] = null;
        } else {
          queryUpdates[keyFor(key)] = value;
        }
      }

      router.replace(
        updateQueryURL(
          pathname,
          normalizedSearchParams,
          queryUpdates,
          resetPage && pageKey ? [pageKey, ...cleanupKeys] : cleanupKeys
        ),
        { scroll: false }
      );
    },
    [
      cleanupKeys,
      keyFor,
      normalizedSearchParams,
      pathname,
      router,
      mergedDefaults,
      pageKey,
    ]
  );

  // Clear specified filters or all active filters
  const clearFilters = useCallback(
    (keysToClear?: string[] | unknown, resetPage = true) => {
      const targets = Array.isArray(keysToClear) ? keysToClear : activeKeys;
      const updates = Object.fromEntries(
        targets.map((key) => [keyFor(key), null])
      );
      router.replace(
        updateQueryURL(
          pathname,
          normalizedSearchParams,
          updates,
          (typeof resetPage === 'boolean' ? resetPage : true) && pageKey
            ? [pageKey, ...cleanupKeys]
            : cleanupKeys
        ),
        { scroll: false }
      );
    },
    [
      cleanupKeys,
      keyFor,
      normalizedSearchParams,
      pathname,
      router,
      activeKeys,
      pageKey,
    ]
  );

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const filters = useMemo(() => {
    return new Proxy(
      {},
      {
        get: (_target, prop: string) => {
          return getFilter(prop);
        },
      }
    ) as Record<string, string>;
  }, [getFilter]);

  return {
    filters,
    getFilter,
    setFilter,
    setFilters,
    clearFilters,
    resetFilters: clearFilters,
    isFilterActive,
    hasActiveFilters,
    activeFilterCount,
    activeKeys,
    isExpanded,
    setIsExpanded,
    toggleExpanded,
  };
}
