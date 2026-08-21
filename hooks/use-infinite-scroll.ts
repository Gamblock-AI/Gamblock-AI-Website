'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface UseInfiniteScrollOptions<T> {
  /** Source array of items to progressively slice and display */
  items: readonly T[];
  /** Number of items to display on initial render (default: 15) */
  initialBatchSize?: number;
  /** Number of items to append on each scroll trigger (default: 15) */
  batchSize?: number;
  /** Root margin string passed to IntersectionObserver (default: '100px') */
  rootMargin?: string;
}

export interface UseInfiniteScrollResult<T> {
  /** Array of items currently rendered in the DOM */
  displayedItems: T[];
  /** Whether more items are available in the source array */
  hasMore: boolean;
  /** Manually trigger loading of the next batch */
  loadMore: () => void;
  /** Reset displayed items back to the initial batch */
  reset: () => void;
  /** Total number of items in the source array */
  totalCount: number;
  /** Current number of rendered items */
  displayedCount: number;
  /** Ref callback to attach to a bottom sentinel element */
  sentinelRef: (node: HTMLElement | null) => void;
}

export function useInfiniteScroll<T>({
  items,
  initialBatchSize = 15,
  batchSize = 15,
  rootMargin = '100px',
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollResult<T> {
  const [displayedCount, setDisplayedCount] = useState<number>(initialBatchSize);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelNodeRef = useRef<HTMLElement | null>(null);

  // Reset count whenever items reference or items length changes
  const prevItemsRef = useRef(items);
  useEffect(() => {
    if (prevItemsRef.current !== items) {
      prevItemsRef.current = items;
      setDisplayedCount(initialBatchSize);
    }
  }, [items, initialBatchSize]);

  const totalCount = items.length;
  const clampedDisplayedCount = Math.min(displayedCount, totalCount);
  const hasMore = clampedDisplayedCount < totalCount;

  const displayedItems = useMemo(
    () => items.slice(0, clampedDisplayedCount),
    [items, clampedDisplayedCount]
  );

  const loadMore = useCallback(() => {
    setDisplayedCount((prev) => {
      if (prev >= items.length) return prev;
      return Math.min(prev + batchSize, items.length);
    });
  }, [batchSize, items.length]);

  const reset = useCallback(() => {
    setDisplayedCount(initialBatchSize);
  }, [initialBatchSize]);

  // Handle intersection observer on the bottom sentinel node
  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      sentinelNodeRef.current = node;

      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!node || !hasMore) return;

      if (typeof IntersectionObserver !== 'undefined') {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            const first = entries[0];
            if (first?.isIntersecting) {
              loadMore();
            }
          },
          { rootMargin }
        );
        observerRef.current.observe(node);
      }
    },
    [hasMore, loadMore, rootMargin]
  );

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  return {
    displayedItems,
    hasMore,
    loadMore,
    reset,
    totalCount,
    displayedCount: clampedDisplayedCount,
    sentinelRef,
  };
}
