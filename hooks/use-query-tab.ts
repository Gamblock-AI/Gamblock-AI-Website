'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/routing';
import { updateQueryURL } from '@/lib/query-params';

export type QueryTabValue = string | number;

export interface UseQueryTabOptions<TValue extends QueryTabValue> {
  queryKey: string;
  values: readonly TValue[];
  defaultValue: TValue;
  resetKeys?: readonly string[];
  removeKeys?: readonly string[];
  clearKeys?: readonly string[];
  history?: 'push' | 'replace';
}

export interface UseQueryTabResult<TValue extends QueryTabValue> {
  value: TValue;
  setValue: (value: TValue) => void;
  hrefFor: (value: TValue) => string;
}

function asQueryValue(value: QueryTabValue) {
  return String(value);
}

export function useQueryTab<TValue extends QueryTabValue>({
  queryKey,
  values,
  defaultValue,
  resetKeys = [],
  removeKeys = [],
  clearKeys = [],
  history = 'push',
}: UseQueryTabOptions<TValue>): UseQueryTabResult<TValue> {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const cleanupKeys = removeKeys;
  const allowedValues = useMemo(
    () => new Set(values.map(asQueryValue)),
    [values]
  );

  const canonicalValues = searchParams.getAll(queryKey);
  const canonicalValue =
    canonicalValues.length === 1 ? canonicalValues[0] : null;
  const hasValidCanonicalValue =
    canonicalValue !== null && allowedValues.has(canonicalValue);
  const candidate = hasValidCanonicalValue
    ? canonicalValue
    : asQueryValue(defaultValue);
  const value =
    values.find((item) => asQueryValue(item) === candidate) ?? defaultValue;
  const isCanonical =
    canonicalValues.length === 1 &&
    hasValidCanonicalValue &&
    cleanupKeys.every((key) => !searchParams.has(key));

  const buildUrl = useCallback(
    (nextValue: TValue) => {
      return updateQueryURL(
        pathname,
        searchParams,
        { [queryKey]: asQueryValue(nextValue) },
        [...resetKeys, ...cleanupKeys, ...clearKeys]
      );
    },
    [clearKeys, cleanupKeys, pathname, queryKey, resetKeys, searchParams]
  );

  const replaceCanonicalValue = useCallback(
    (nextValue: TValue) => {
      const url = buildUrl(nextValue);
      router.replace(url, { scroll: false });
    },
    [buildUrl, router]
  );

  useEffect(() => {
    if (!isCanonical) replaceCanonicalValue(value);
  }, [isCanonical, replaceCanonicalValue, value]);

  const setValue = useCallback(
    (nextValue: TValue) => {
      const safeValue = allowedValues.has(asQueryValue(nextValue))
        ? nextValue
        : defaultValue;
      const url = buildUrl(safeValue);
      if (history === 'push') {
        router.push(url, { scroll: false });
      } else {
        router.replace(url, { scroll: false });
      }
    },
    [allowedValues, buildUrl, defaultValue, history, router]
  );

  const hrefFor = useCallback(
    (nextValue: TValue) =>
      buildUrl(
        allowedValues.has(asQueryValue(nextValue)) ? nextValue : defaultValue
      ),
    [allowedValues, buildUrl, defaultValue]
  );

  return { value, setValue, hrefFor };
}
