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
    currentParams = new URLSearchParams(
      'filter.tickets.priority=urgent&filter.tickets.status=waiting_support'
    );
    const { result } = renderHook(() =>
      useQueryFilters({
        resourceKey: 'tickets',
        filterKeys: ['priority', 'status', 'assignee'],
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
      'tab.support=team&filter.tickets.priority=urgent&filter.tickets.status=all&filter.tickets.q=test'
    );
    const { result } = renderHook(() =>
      useQueryFilters({
        filterKeys: ['priority', 'status', 'q'],
        resourceKey: 'tickets',
        defaultValues: { status: 'all' },
      })
    );

    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.activeFilterCount).toBe(2); // priority and q
    expect(result.current.activeKeys).toEqual(['priority', 'q']);
  });

  it('preserves unrelated namespaced navigation state while resetting its own page key', () => {
    currentParams = new URLSearchParams(
      'tab.support=team&filter.tickets.status=open&page.support=3&page.audit=5'
    );
    const { result } = renderHook(() =>
      useQueryFilters({
        resourceKey: 'tickets',
        filterKeys: ['status'],
        pageKey: 'page.support',
      })
    );

    act(() => {
      result.current.setFilter('status', 'closed');
    });

    expect(mockReplace).toHaveBeenCalledWith(
      '/admin/tickets?tab.support=team&filter.tickets.status=closed&page.audit=5',
      { scroll: false }
    );
  });

  it('updates a single filter and resets page if configured', () => {
    currentParams = new URLSearchParams(
      'page.content=3&filter.content.status=published'
    );
    const { result } = renderHook(() =>
      useQueryFilters({
        resourceKey: 'content',
        filterKeys: ['status'],
        pageKey: 'page.content',
      })
    );

    act(() => {
      result.current.setFilter('status', 'draft');
    });

    expect(mockReplace).toHaveBeenCalledWith(
      '/admin/tickets?filter.content.status=draft',
      {
        scroll: false,
      }
    );

    act(() => {
      result.current.setFilter('status', 'all');
    });

    expect(mockReplace).toHaveBeenCalledWith('/admin/tickets', {
      scroll: false,
    });
  });

  it('removes legacy flat keys without reading their values', () => {
    currentParams = new URLSearchParams('q=legacy&status=legacy&page.content=2');
    renderHook(() =>
      useQueryFilters({
        resourceKey: 'content',
        filterKeys: ['q', 'status'],
        pageKey: 'page.content',
        removeKeys: ['q', 'status'],
      })
    );

    expect(mockReplace).toHaveBeenCalledTimes(1);
    const url = mockReplace.mock.calls[0][0];
    const query = new URLSearchParams(url.split('?')[1]);
    expect(query.has('q')).toBe(false);
    expect(query.has('status')).toBe(false);
    expect(query.has('filter.content.q')).toBe(false);
    expect(query.has('filter.content.status')).toBe(false);
    expect(query.get('page.content')).toBe('2');
  });

  it('updates multiple filters at once', () => {
    currentParams = new URLSearchParams('page.tickets=2');
    const { result } = renderHook(() =>
      useQueryFilters({
        resourceKey: 'tickets',
        filterKeys: ['priority', 'status'],
        pageKey: 'page.tickets',
      })
    );

    act(() => {
      result.current.setFilters({
        priority: 'high',
        status: 'open',
      });
    });

    expect(mockReplace).toHaveBeenCalledWith(
      '/admin/tickets?filter.tickets.priority=high&filter.tickets.status=open',
      { scroll: false }
    );
  });

  it('clears specific or all active filters and safely handles event objects', () => {
    currentParams = new URLSearchParams(
      'tab.adminTickets=active&filter.adminTickets.priority=urgent&filter.adminTickets.status=open&page.adminTickets=2'
    );
    const { result } = renderHook(() =>
      useQueryFilters({
        resourceKey: 'adminTickets',
        filterKeys: ['priority', 'status'],
        pageKey: 'page.adminTickets',
      })
    );

    act(() => {
      result.current.clearFilters(['priority']);
    });

    expect(mockReplace).toHaveBeenCalledWith(
      '/admin/tickets?tab.adminTickets=active&filter.adminTickets.status=open',
      { scroll: false }
    );

    // Simulate clicking a button where an event object is passed to resetFilters/clearFilters
    act(() => {
      // @ts-expect-error test event passing
      result.current.resetFilters({ type: 'click', preventDefault: () => {} });
    });

    expect(mockReplace).toHaveBeenCalledWith(
      '/admin/tickets?tab.adminTickets=active',
      { scroll: false }
    );
  });

  it('handles collapsible toggle state', () => {
    currentParams = new URLSearchParams();
    const { result } = renderHook(() =>
      useQueryFilters({ resourceKey: 'tickets', filterKeys: [] })
    );

    expect(result.current.isExpanded).toBe(false);

    act(() => {
      result.current.toggleExpanded();
    });

    expect(result.current.isExpanded).toBe(true);
  });
});
