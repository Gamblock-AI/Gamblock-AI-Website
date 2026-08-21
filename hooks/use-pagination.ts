'use client';

import { useCallback, useMemo, useState } from 'react';

export interface UsePaginationOptions<T = unknown> {
  /** Array of items to paginate. If provided, paginatedItems will be sliced automatically. */
  items?: readonly T[];
  /** Total count of items. Used when items array is omitted (e.g. server-side pagination). */
  totalItems?: number;
  /** Number of items displayed per page. Default is 6. */
  pageSize?: number;
  /** Initial page index (1-indexed). Default is 1. */
  initialPage?: number;
}

export interface UsePaginationResult<T = unknown> {
  /** Current active page number (1-indexed, safely clamped between 1 and totalPages). */
  page: number;
  /** Set page to a specific page number or updater function. */
  setPage: (pageOrUpdater: number | ((prev: number) => number)) => void;
  /** Total number of pages available (minimum 1). */
  totalPages: number;
  /** Total count of items across all pages. */
  totalItems: number;
  /** Current page size. */
  pageSize: number;
  /** Update page size dynamically. */
  setPageSize: (size: number) => void;
  /** Sliced items for the active page. */
  paginatedItems: T[];
  /** Alias for paginatedItems. */
  pagedItems: T[];
  /** 1-indexed start item number for display (e.g., "Showing 1 to 6"). 0 if totalItems is 0. */
  startIndex: number;
  /** 1-indexed end item number for display. */
  endIndex: number;
  /** True if there is a next page. */
  hasNextPage: boolean;
  /** True if there is a previous page. */
  hasPrevPage: boolean;
  /** Navigate to the next page. */
  nextPage: () => void;
  /** Navigate to the previous page. */
  prevPage: () => void;
  /** Jump to the first page. */
  goToFirstPage: () => void;
  /** Jump to the last page. */
  goToLastPage: () => void;
}

export function usePagination<T = unknown>({
  items,
  totalItems: customTotalItems,
  pageSize: initialPageSize = 6,
  initialPage = 1,
}: UsePaginationOptions<T> = {}): UsePaginationResult<T> {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [pageSize, setPageSizeState] = useState<number>(
    Math.max(1, initialPageSize)
  );

  const totalCount = items ? items.length : Math.max(0, customTotalItems ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Clamped safe page ensures user never lands on out-of-bounds page if data size changes
  const safePage = Math.max(1, Math.min(currentPage, totalPages));

  const paginatedItems = useMemo<T[]>(() => {
    if (!items) return [];
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize) as T[];
  }, [items, safePage, pageSize]);

  const startIndex = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endIndex = Math.min(safePage * pageSize, totalCount);

  const hasPrevPage = safePage > 1;
  const hasNextPage = safePage < totalPages;

  const setPage = useCallback(
    (pageOrUpdater: number | ((prev: number) => number)) => {
      setCurrentPage((prev) => {
        const next =
          typeof pageOrUpdater === 'function'
            ? pageOrUpdater(Math.max(1, Math.min(prev, totalPages)))
            : pageOrUpdater;
        return Math.max(1, Math.min(next, totalPages));
      });
    },
    [totalPages]
  );

  const setPageSize = useCallback((newSize: number) => {
    setPageSizeState(Math.max(1, newSize));
  }, []);

  const nextPage = useCallback(() => {
    setPage((p) => p + 1);
  }, [setPage]);

  const prevPage = useCallback(() => {
    setPage((p) => p - 1);
  }, [setPage]);

  const goToFirstPage = useCallback(() => {
    setPage(1);
  }, [setPage]);

  const goToLastPage = useCallback(() => {
    setPage(totalPages);
  }, [setPage, totalPages]);

  return {
    page: safePage,
    setPage,
    totalPages,
    totalItems: totalCount,
    pageSize,
    setPageSize,
    paginatedItems,
    pagedItems: paginatedItems,
    startIndex,
    endIndex,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
  };
}
