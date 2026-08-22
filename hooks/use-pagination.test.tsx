import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from './use-pagination';
import { getPaginationItems } from '@/components/dashboard/pagination';

describe('usePagination', () => {
  const dummyItems = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
  }));

  it('initializes with default options and slices first page correctly', () => {
    const { result } = renderHook(() =>
      usePagination({ items: dummyItems, pageSize: 6 })
    );

    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(5); // ceil(25 / 6) = 5
    expect(result.current.totalItems).toBe(25);
    expect(result.current.pageSize).toBe(6);
    expect(result.current.paginatedItems).toHaveLength(6);
    expect(result.current.paginatedItems[0].id).toBe(1);
    expect(result.current.paginatedItems[5].id).toBe(6);
    expect(result.current.startIndex).toBe(1);
    expect(result.current.endIndex).toBe(6);
    expect(result.current.hasPrevPage).toBe(false);
    expect(result.current.hasNextPage).toBe(true);
  });

  it('handles navigation across pages (next, prev, first, last)', () => {
    const { result } = renderHook(() =>
      usePagination({ items: dummyItems, pageSize: 6 })
    );

    // Next page -> 2
    act(() => {
      result.current.nextPage();
    });
    expect(result.current.page).toBe(2);
    expect(result.current.startIndex).toBe(7);
    expect(result.current.endIndex).toBe(12);
    expect(result.current.hasPrevPage).toBe(true);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.paginatedItems[0].id).toBe(7);

    // Go to last page -> 5
    act(() => {
      result.current.goToLastPage();
    });
    expect(result.current.page).toBe(5);
    expect(result.current.startIndex).toBe(25);
    expect(result.current.endIndex).toBe(25);
    expect(result.current.paginatedItems).toHaveLength(1);
    expect(result.current.paginatedItems[0].id).toBe(25);
    expect(result.current.hasNextPage).toBe(false);

    // Prev page -> 4
    act(() => {
      result.current.prevPage();
    });
    expect(result.current.page).toBe(4);
    expect(result.current.paginatedItems).toHaveLength(6);

    // Go to first page -> 1
    act(() => {
      result.current.goToFirstPage();
    });
    expect(result.current.page).toBe(1);
  });

  it('safely clamps out-of-bounds page requests', () => {
    const { result } = renderHook(() =>
      usePagination({ items: dummyItems, pageSize: 6 })
    );

    act(() => {
      result.current.setPage(999);
    });
    expect(result.current.page).toBe(5);

    act(() => {
      result.current.setPage(-10);
    });
    expect(result.current.page).toBe(1);

    // Function updater
    act(() => {
      result.current.setPage((prev) => prev + 10);
    });
    expect(result.current.page).toBe(5);
  });

  it('auto-clamps page when items array dynamically shrinks', () => {
    let items = dummyItems; // 25 items -> 5 pages
    const { result, rerender } = renderHook(() =>
      usePagination({ items, pageSize: 6 })
    );

    act(() => {
      result.current.setPage(5);
    });
    expect(result.current.page).toBe(5);

    // Shrink items to 8 items -> 2 pages
    items = dummyItems.slice(0, 8);
    rerender();

    expect(result.current.totalPages).toBe(2);
    expect(result.current.page).toBe(2);
    expect(result.current.paginatedItems).toHaveLength(2); // items 7, 8
  });

  it('handles empty items array gracefully', () => {
    const { result } = renderHook(() =>
      usePagination({ items: [], pageSize: 6 })
    );

    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.paginatedItems).toEqual([]);
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(0);
    expect(result.current.hasPrevPage).toBe(false);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('supports changing page size dynamically', () => {
    const { result } = renderHook(() =>
      usePagination({ items: dummyItems, pageSize: 6 })
    );

    act(() => {
      result.current.setPageSize(10);
    });

    expect(result.current.pageSize).toBe(10);
    expect(result.current.totalPages).toBe(3); // ceil(25 / 10) = 3
    expect(result.current.paginatedItems).toHaveLength(10);
  });

  it('works with totalItems without items array', () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 30, pageSize: 10, initialPage: 2 })
    );

    expect(result.current.page).toBe(2);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.totalItems).toBe(30);
    expect(result.current.startIndex).toBe(11);
    expect(result.current.endIndex).toBe(20);
    expect(result.current.paginatedItems).toEqual([]);
  });
});

describe('getPaginationItems', () => {
  it('returns all pages when totalPages <= 7 (totalNumbers threshold)', () => {
    expect(getPaginationItems(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPaginationItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('renders right ellipsis when active page is near the start', () => {
    // Page 1 of 30
    expect(getPaginationItems(1, 30)).toEqual([
      1,
      2,
      3,
      4,
      5,
      'ellipsis-right',
      30,
    ]);
    // Page 3 of 30
    expect(getPaginationItems(3, 30)).toEqual([
      1,
      2,
      3,
      4,
      5,
      'ellipsis-right',
      30,
    ]);
  });

  it('renders both left and right ellipsis when active page is in the middle', () => {
    // Page 4 of 30
    expect(getPaginationItems(4, 30)).toEqual([
      1,
      'ellipsis-left',
      3,
      4,
      5,
      'ellipsis-right',
      30,
    ]);
    // Page 15 of 30
    expect(getPaginationItems(15, 30)).toEqual([
      1,
      'ellipsis-left',
      14,
      15,
      16,
      'ellipsis-right',
      30,
    ]);
  });

  it('renders left ellipsis when active page is near the end', () => {
    // Page 27 of 30
    expect(getPaginationItems(27, 30)).toEqual([
      1,
      'ellipsis-left',
      26,
      27,
      28,
      29,
      30,
    ]);
    // Page 30 of 30
    expect(getPaginationItems(30, 30)).toEqual([
      1,
      'ellipsis-left',
      26,
      27,
      28,
      29,
      30,
    ]);
  });
});
