'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/routing';
import { normalizeQueryParams, updateQueryURL } from '@/lib/query-params';

export interface PaginatedData<T> {
  items: T[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_more: boolean;
}

export interface UsePaginationOptions<T = unknown> {
  /** Items already returned by the server for the active page. */
  items?: readonly T[];
  totalItems?: number;
  totalPages?: number;
  hasMore?: boolean;
  pageSize?: number;
  initialPage?: number;
  /** URL key, normally `page.resource`. */
  pageKey?: string;
}

export interface UsePaginationResult<T = unknown> {
  page: number;
  setPage: (pageOrUpdater: number | ((prev: number) => number)) => void;
  resetPage: () => void;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  /** Server-returned items for the active page; never slices locally. */
  items: T[];
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
}

function readPage(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function usePagination<T = unknown>({
  items = [],
  totalItems = items.length,
  totalPages: providedTotalPages,
  hasMore: providedHasMore,
  pageSize: initialPageSize = 6,
  initialPage = 1,
  pageKey = 'page',
}: UsePaginationOptions<T> = {}): UsePaginationResult<T> {
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const normalizedSearchParams = useMemo(
    () => normalizeQueryParams(searchParamsString),
    [searchParamsString]
  );
  const pathname = usePathname();
  const router = useRouter();
  const pageSize = Math.max(1, initialPageSize);
  const normalizedTotalItems = Math.max(0, totalItems);
  const totalPages = Math.max(
    1,
    providedTotalPages ?? Math.ceil(normalizedTotalItems / pageSize)
  );
  const requestedPage = readPage(
    normalizedSearchParams.get(pageKey),
    initialPage
  );
  const hasKnownTotal =
    providedTotalPages !== undefined || totalItems > 0 || items.length > 0;
  const page = hasKnownTotal ? Math.min(requestedPage, totalPages) : requestedPage;

  const replacePage = useCallback(
    (nextPage: number) => {
      const safePage = Math.max(1, Math.min(Math.trunc(nextPage), totalPages));
      const url = updateQueryURL(
        pathname,
        normalizedSearchParams,
        { [pageKey]: safePage === 1 ? null : safePage }
      );
      router.replace(url, {
        scroll: false,
      });
    },
    [normalizedSearchParams, pageKey, pathname, router, totalPages]
  );

  useEffect(() => {
    if (requestedPage !== page) replacePage(page);
  }, [page, replacePage, requestedPage]);

  const setPage = useCallback(
    (pageOrUpdater: number | ((prev: number) => number)) => {
      const next =
        typeof pageOrUpdater === 'function'
          ? pageOrUpdater(page)
          : pageOrUpdater;
      replacePage(next);
    },
    [page, replacePage]
  );
  const resetPage = useCallback(() => replacePage(1), [replacePage]);
  const startIndex = normalizedTotalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, normalizedTotalItems);
  const hasNextPage = providedHasMore ?? page < totalPages;
  const hasPrevPage = page > 1;

  return useMemo(
    () => ({
      page,
      setPage,
      resetPage,
      totalPages,
      totalItems: normalizedTotalItems,
      pageSize,
      items: [...items],
      startIndex,
      endIndex,
      hasNextPage,
      hasPrevPage,
      nextPage: () => setPage((current) => current + 1),
      prevPage: () => setPage((current) => current - 1),
      goToFirstPage: () => setPage(1),
      goToLastPage: () => setPage(totalPages),
    }),
    [
      endIndex,
      hasNextPage,
      hasPrevPage,
      items,
      normalizedTotalItems,
      page,
      pageSize,
      resetPage,
      setPage,
      startIndex,
      totalPages,
    ]
  );
}
