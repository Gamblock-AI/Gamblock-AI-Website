import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useQueryTab } from './use-query-tab';

let currentParams = new URLSearchParams();
const mockPush = vi.fn((url: string) => {
  const queryIndex = url.indexOf('?');
  currentParams = new URLSearchParams(
    queryIndex >= 0 ? url.slice(queryIndex + 1) : ''
  );
});
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
  usePathname: () => '/id/support',
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

const tabOptions = {
  queryKey: 'tab.support',
  values: ['partner', 'team', 'hotline'] as const,
  defaultValue: 'partner' as const,
  resetKeys: ['page.support'],
};

describe('useQueryTab', () => {
  beforeEach(() => {
    currentParams = new URLSearchParams();
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  it('hydrates a valid value without canonicalizing it', () => {
    currentParams = new URLSearchParams(
      'tab.support=team&status=open&page.support=3&page.audit=4'
    );

    const { result } = renderHook(() => useQueryTab(tabOptions));

    expect(result.current.value).toBe('team');
    expect(mockReplace).not.toHaveBeenCalled();
    expect(result.current.hrefFor('hotline')).toBe(
      '/id/support?tab.support=hotline&status=open&page.audit=4'
    );
  });

  it('canonicalizes a legacy bracketed key when it is still present', () => {
    currentParams = new URLSearchParams(
      'tab%5Bsupport%5D=team&status=open'
    );

    const { result } = renderHook(() => useQueryTab(tabOptions));

    expect(result.current.value).toBe('team');
    expect(mockReplace).toHaveBeenCalledWith(
      '/id/support?tab.support=team&status=open',
      { scroll: false }
    );
  });

  it('uses and canonicalizes the default value when the query key is absent', () => {
    currentParams = new URLSearchParams(
      'status=open&page.support=3&page.audit=4'
    );

    const { result } = renderHook(() => useQueryTab(tabOptions));

    expect(result.current.value).toBe('partner');
    expect(mockReplace).toHaveBeenCalledWith(
      '/id/support?status=open&page.audit=4&tab.support=partner',
      { scroll: false }
    );
  });

  it('falls back to the default and canonicalizes an invalid value', () => {
    currentParams = new URLSearchParams(
      'tab.support=unknown&status=open'
    );

    const { result } = renderHook(() => useQueryTab(tabOptions));

    expect(result.current.value).toBe('partner');
    expect(mockReplace).toHaveBeenCalledWith(
      '/id/support?tab.support=partner&status=open',
      { scroll: false }
    );
  });

  it('falls back to the default and removes duplicate values', () => {
    currentParams = new URLSearchParams(
      'tab.support=team&tab.support=hotline&status=open'
    );

    const { result } = renderHook(() => useQueryTab(tabOptions));

    expect(result.current.value).toBe('partner');
    expect(mockReplace).toHaveBeenCalledWith(
      '/id/support?tab.support=partner&status=open',
      { scroll: false }
    );
  });

  it('preserves unrelated query params and resets only owned pagination on push', () => {
    currentParams = new URLSearchParams(
      'tab.support=partner&status=open&page.support=3&page.audit=9&lang=id'
    );
    const { result } = renderHook(() => useQueryTab(tabOptions));

    act(() => {
      result.current.setValue('team');
    });

    expect(mockPush).toHaveBeenCalledWith(
      '/id/support?tab.support=team&status=open&page.audit=9&lang=id',
      { scroll: false }
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('uses replace instead of push when history is replace', () => {
    currentParams = new URLSearchParams('tab.support=partner');
    const { result } = renderHook(() =>
      useQueryTab({ ...tabOptions, history: 'replace' })
    );

    act(() => {
      result.current.setValue('hotline');
    });

    expect(mockReplace).toHaveBeenCalledWith(
      '/id/support?tab.support=hotline',
      { scroll: false }
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('clears canonical state owned by the selected tab', () => {
    currentParams = new URLSearchParams(
      'tab.support=active&filter.tickets.status=open&page.support=3'
    );
    const { result } = renderHook(() =>
      useQueryTab({
        ...tabOptions,
        clearKeys: ['filter.tickets.status'],
      })
    );

    act(() => {
      result.current.setValue('team');
    });

    expect(mockPush).toHaveBeenCalledWith(
      '/id/support?tab.support=team',
      { scroll: false }
    );
  });

  it('removes obsolete keys while canonicalizing the replacement', () => {
    currentParams = new URLSearchParams(
      'channel=team&status=open&page.support=4'
    );
    const { result } = renderHook(() =>
      useQueryTab({
        ...tabOptions,
        removeKeys: ['channel'],
      })
    );

    expect(result.current.value).toBe('partner');
    expect(mockReplace).toHaveBeenCalledWith(
      '/id/support?status=open&tab.support=partner',
      { scroll: false }
    );
  });
});
