'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/routing';

export interface UseQueryFiltersOptions {
  /** Filter keys that should be monitored for active filter count and state */
  filterKeys?: string[];
  /** Ignored keys when determining active filter count (e.g. 'section', 'item', 'lang', 'page') */
  ignoredKeys?: string[];
  /** Default values for specific keys (e.g. { status: 'all', priority: 'all' }) */
  defaultValues?: Record<string, string>;
  /** Alias for defaultValues */
  defaultFilters?: Record<string, string>;
  /** Optional pathname override */
  pathname?: string;
  /** Key for pagination reset, e.g. 'page'. When set, updating a filter will reset this key to 1. */
  pageKey?: string;
}

export function useQueryFilters(options: UseQueryFiltersOptions = {}) {
  const searchParams = useSearchParams();
  const routingPathname = usePathname();
  const router = useRouter();

  const {
    filterKeys,
    ignoredKeys = ['section', 'item', 'id', 'lang', 'tab', 'page'],
    defaultValues = {},
    defaultFilters = {},
    pathname: customPathname,
    pageKey,
  } = options;

  const mergedDefaults = useMemo(
    () => ({ ...defaultFilters, ...defaultValues }),
    [defaultFilters, defaultValues]
  );
  const pathname = customPathname ?? routingPathname;

  // Read filter value safely
  const getFilter = useCallback(
    (key: string, fallback?: string): string => {
      const value = searchParams.get(key);
      if (value !== null && value !== '') {
        return value;
      }
      if (fallback !== undefined) {
        return fallback;
      }
      return mergedDefaults[key] ?? '';
    },
    [searchParams, mergedDefaults]
  );

  // Check if a specific filter has an active, non-default value
  const isFilterActive = useCallback(
    (key: string): boolean => {
      const val = searchParams.get(key);
      if (!val || val === '' || val === 'all') {
        return false;
      }
      const defaultVal = mergedDefaults[key];
      if (defaultVal !== undefined && val === defaultVal) {
        return false;
      }
      return true;
    },
    [searchParams, mergedDefaults]
  );

  // Determine active keys and count
  const activeKeys = useMemo(() => {
    const keys: string[] = [];
    searchParams.forEach((val, key) => {
      if (ignoredKeys.includes(key)) return;
      if (filterKeys && !filterKeys.includes(key)) return;
      if (val && val !== '' && val !== 'all' && val !== mergedDefaults[key]) {
        keys.push(key);
      }
    });
    return keys;
  }, [searchParams, ignoredKeys, filterKeys, mergedDefaults]);

  const hasActiveFilters = activeKeys.length > 0;
  const activeFilterCount = activeKeys.length;

  // Collapsible toggle state (defaults to open if URL has active filters, else closed)
  const [isExpanded, setIsExpanded] = useState(() => hasActiveFilters);

  // Update a single filter key
  const setFilter = useCallback(
    (key: string, value: string | null | undefined, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString());
      const defaultVal = mergedDefaults[key];

      if (
        value === null ||
        value === undefined ||
        value === '' ||
        value === 'all' ||
        (defaultVal !== undefined && value === defaultVal)
      ) {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      if (resetPage && pageKey) {
        params.delete(pageKey);
      }

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, pathname, router, mergedDefaults, pageKey]
  );

  // Update multiple filters at once
  const setFilters = useCallback(
    (
      updates: Record<string, string | null | undefined>,
      resetPage = true
    ) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        const defaultVal = mergedDefaults[key];
        if (
          value === null ||
          value === undefined ||
          value === '' ||
          value === 'all' ||
          (defaultVal !== undefined && value === defaultVal)
        ) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      if (resetPage && pageKey) {
        params.delete(pageKey);
      }

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, pathname, router, mergedDefaults, pageKey]
  );

  // Clear specified filters or all active filters
  const clearFilters = useCallback(
    (keysToClear?: string[] | unknown, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString());
      const targets = Array.isArray(keysToClear) ? keysToClear : activeKeys;

      for (const key of targets) {
        params.delete(key);
      }

      if ((typeof resetPage === 'boolean' ? resetPage : true) && pageKey) {
        params.delete(pageKey);
      }

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, pathname, router, activeKeys, pageKey]
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
