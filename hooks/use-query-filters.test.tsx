import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQueryFilters } from './use-query-filters';

let currentParams = new URLSearchParams();
const mockReplace = vi.fn((url: string) => {
  const queryIndex = url.indexOf('?');
  if (queryIndex >= 0) {
    currentParams = new URLSearchParams(url.slice(queryIndex + 1));
  } else {
    currentParams = new URLSearchParams();
  }
});

vi.mock('next/navigation', () => ({
  useSearchParams: () => currentParams,
}));

vi.mock('@/i18n/routing', () => ({
  usePathname: () => '/admin/tickets',
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
}));

describe('useQueryFilters', () => {
  beforeEach(() => {
    currentParams = new URLSearchParams();
    mockReplace.mockClear();
  });

  it('reads filter values with fallback and defaults', () => {
    currentParams = new URLSearchParams('priority=urgent&status=waiting_support');
    const { result } = renderHook(() =>
      useQueryFilters({
        defaultValues: { assignee: 'all' },
      })
    );

    expect(result.current.getFilter('priority')).toBe('urgent');
    expect(result.current.getFilter('status')).toBe('waiting_support');
    expect(result.current.getFilter('assignee')).toBe('all');
    expect(result.current.getFilter('nonexistent', 'fallback')).toBe('fallback');
  });

  it('correctly calculates active filter count and activeKeys', () => {
    currentParams = new URLSearchParams(
      'section=items&priority=urgent&status=all&q=test'
    );
    const { result } = renderHook(() =>
      useQueryFilters({
        filterKeys: ['priority', 'status', 'q'],
        defaultValues: { status: 'all' },
        ignoredKeys: ['section'],
      })
    );

    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.activeFilterCount).toBe(2); // priority and q
    expect(result.current.activeKeys).toEqual(['priority', 'q']);
  });

  it('updates a single filter and resets page if configured', () => {
    currentParams = new URLSearchParams('page=3&status=published');
    const { result } = renderHook(() =>
      useQueryFilters({
        pageKey: 'page',
      })
    );

    act(() => {
      result.current.setFilter('status', 'draft');
    });

    expect(mockReplace).toHaveBeenCalledWith('/admin/tickets?status=draft', {
      scroll: false,
    });

    act(() => {
      result.current.setFilter('status', 'all');
    });

    expect(mockReplace).toHaveBeenCalledWith('/admin/tickets', {
      scroll: false,
    });
  });

  it('updates multiple filters at once', () => {
    currentParams = new URLSearchParams('page=2');
    const { result } = renderHook(() =>
      useQueryFilters({
        pageKey: 'page',
      })
    );

    act(() => {
      result.current.setFilters({
        priority: 'high',
        status: 'open',
      });
    });

    expect(mockReplace).toHaveBeenCalledWith(
      '/admin/tickets?priority=high&status=open',
      { scroll: false }
    );
  });

  it('clears specific or all active filters and safely handles event objects', () => {
    currentParams = new URLSearchParams(
      'section=items&priority=urgent&status=open&page=2'
    );
    const { result } = renderHook(() =>
      useQueryFilters({
        filterKeys: ['priority', 'status'],
        pageKey: 'page',
        ignoredKeys: ['section'],
      })
    );

    act(() => {
      result.current.clearFilters(['priority']);
    });

    expect(mockReplace).toHaveBeenCalledWith(
      '/admin/tickets?section=items&status=open',
      { scroll: false }
    );

    // Simulate clicking a button where an event object is passed to resetFilters/clearFilters
    act(() => {
      // @ts-expect-error test event passing
      result.current.resetFilters({ type: 'click', preventDefault: () => {} });
    });

    expect(mockReplace).toHaveBeenCalledWith(
      '/admin/tickets?section=items',
      { scroll: false }
    );
  });

  it('handles collapsible toggle state', () => {
    currentParams = new URLSearchParams();
    const { result } = renderHook(() => useQueryFilters());

    expect(result.current.isExpanded).toBe(false);

    act(() => {
      result.current.toggleExpanded();
    });

    expect(result.current.isExpanded).toBe(true);
  });
});
