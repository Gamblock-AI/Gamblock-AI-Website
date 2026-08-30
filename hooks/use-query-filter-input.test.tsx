import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useQueryFilterInput } from './use-query-filter-input';

let currentParams = new URLSearchParams();
const mockReplace = vi.fn((url: string) => {
  const queryIndex = url.indexOf('?');
  currentParams = new URLSearchParams(
    queryIndex >= 0 ? url.slice(queryIndex + 1) : ''
  );
});

vi.mock('next/navigation', () => ({
  useSearchParams: () => currentParams,
}));

vi.mock('@/i18n/routing', () => ({
  usePathname: () => '/admin/tickets',
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

describe('useQueryFilterInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    currentParams = new URLSearchParams();
    mockReplace.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces search updates and resets the namespaced page key', () => {
    currentParams = new URLSearchParams(
      'filter%5Btickets%5D%5Bq%5D=old&page%5Bsupport%5D=3&page.audit=2'
    );
    const { result } = renderHook(() =>
      useQueryFilterInput({
        resourceKey: 'tickets',
        pageKey: 'page.support',
      })
    );

    act(() => {
      result.current.onChange('new value');
    });

    expect(mockReplace).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(349);
    });
    expect(mockReplace).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(mockReplace).toHaveBeenCalledWith(
      '/admin/tickets?filter.tickets.q=new+value&page.audit=2',
      { scroll: false }
    );
  });

  it('resets the canonical search value and page without touching other resources', () => {
    currentParams = new URLSearchParams(
      'filter.accounts.q=alice&page.accounts=4&page.audit=2'
    );
    const { result } = renderHook(() =>
      useQueryFilterInput({
        resourceKey: 'accounts',
        pageKey: 'page.accounts',
      })
    );

    act(() => {
      result.current.reset();
    });

    expect(mockReplace).toHaveBeenCalledWith(
      '/admin/tickets?page.audit=2',
      { scroll: false }
    );
  });
});
