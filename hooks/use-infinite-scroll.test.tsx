import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useInfiniteScroll } from './use-infinite-scroll';

describe('useInfiniteScroll', () => {
  const sampleItems = Array.from({ length: 45 }, (_, i) => `item-${i + 1}`);

  it('initializes with default initialBatchSize of 15', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({ items: sampleItems })
    );

    expect(result.current.displayedItems).toHaveLength(15);
    expect(result.current.displayedItems[0]).toBe('item-1');
    expect(result.current.displayedItems[14]).toBe('item-15');
    expect(result.current.hasMore).toBe(true);
    expect(result.current.totalCount).toBe(45);
    expect(result.current.displayedCount).toBe(15);
  });

  it('loads more items incrementally with loadMore()', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({ items: sampleItems, initialBatchSize: 10, batchSize: 10 })
    );

    expect(result.current.displayedItems).toHaveLength(10);
    expect(result.current.hasMore).toBe(true);

    act(() => {
      result.current.loadMore();
    });

    expect(result.current.displayedItems).toHaveLength(20);
    expect(result.current.displayedCount).toBe(20);
    expect(result.current.hasMore).toBe(true);

    act(() => {
      result.current.loadMore();
    });

    expect(result.current.displayedItems).toHaveLength(30);

    act(() => {
      result.current.loadMore();
    });

    expect(result.current.displayedItems).toHaveLength(40);

    act(() => {
      result.current.loadMore();
    });

    // Last batch reaches max 45
    expect(result.current.displayedItems).toHaveLength(45);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.displayedCount).toBe(45);
  });

  it('handles empty items array gracefully', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll<string>({ items: [] })
    );

    expect(result.current.displayedItems).toEqual([]);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.displayedCount).toBe(0);
  });

  it('handles items array with fewer elements than initialBatchSize', () => {
    const fewItems = ['a', 'b', 'c'];
    const { result } = renderHook(() =>
      useInfiniteScroll({ items: fewItems, initialBatchSize: 15 })
    );

    expect(result.current.displayedItems).toEqual(['a', 'b', 'c']);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.totalCount).toBe(3);
    expect(result.current.displayedCount).toBe(3);
  });

  it('automatically resets displayed count when items change', () => {
    let currentList = sampleItems;
    const { result, rerender } = renderHook(
      ({ list }) => useInfiniteScroll({ items: list, initialBatchSize: 5, batchSize: 5 }),
      { initialProps: { list: currentList } }
    );

    expect(result.current.displayedItems).toHaveLength(5);

    act(() => {
      result.current.loadMore();
    });
    expect(result.current.displayedItems).toHaveLength(10);

    // Switch to filtered array
    currentList = ['item-1', 'item-2', 'item-3'];
    rerender({ list: currentList });

    expect(result.current.displayedItems).toHaveLength(3);
    expect(result.current.totalCount).toBe(3);
    expect(result.current.hasMore).toBe(false);
  });

  it('supports explicit reset() method', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({ items: sampleItems, initialBatchSize: 10, batchSize: 10 })
    );

    act(() => {
      result.current.loadMore();
      result.current.loadMore();
    });
    expect(result.current.displayedItems).toHaveLength(30);

    act(() => {
      result.current.reset();
    });
    expect(result.current.displayedItems).toHaveLength(10);
    expect(result.current.hasMore).toBe(true);
  });
});
