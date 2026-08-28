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
  queryKey: 'tab[support]',
  values: ['partner', 'team', 'hotline'] as const,
  defaultValue: 'partner' as const,
  resetKeys: ['page[support]'],
};

describe('useQueryTab', () => {
  beforeEach(() => {
    currentParams = new URLSearchParams();
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  it('hydrates a valid value without canonicalizing it', () => {
    currentParams = new URLSearchParams(
      'tab%5Bsupport%5D=team&status=open&page%5Bsupport%5D=3&page%5Baudit%5D=4'
    );

    const { result } = renderHook(() => useQueryTab(tabOptions));

    expect(result.current.value).toBe('team');
    expect(mockReplace).not.toHaveBeenCalled();
    expect(result.current.hrefFor('hotline')).toBe(
      '/id/support?tab%5Bsupport%5D=hotline&status=open&page%5Baudit%5D=4'
    );
  });

  it('uses and canonicalizes the default value when the query key is absent', () => {
    currentParams = new URLSearchParams(
      'status=open&page%5Bsupport%5D=3&page%5Baudit%5D=4'
    );

    const { result } = renderHook(() => useQueryTab(tabOptions));

    expect(result.current.value).toBe('partner');
    expect(mockReplace).toHaveBeenCalledWith(
      '/id/support?status=open&page%5Baudit%5D=4&tab%5Bsupport%5D=partner',
      { scroll: false }
    );
  });

  it('falls back to the default and canonicalizes an invalid value', () => {
    currentParams = new URLSearchParams(
      'tab%5Bsupport%5D=unknown&status=open'
    );

    const { result } = renderHook(() => useQueryTab(tabOptions));

    expect(result.current.value).toBe('partner');
    expect(mockReplace).toHaveBeenCalledWith(
      '/id/support?tab%5Bsupport%5D=partner&status=open',
      { scroll: false }
    );
  });

  it('falls back to the default and removes duplicate values', () => {
    currentParams = new URLSearchParams(
      'tab%5Bsupport%5D=team&tab%5Bsupport%5D=hotline&status=open'
    );

    const { result } = renderHook(() => useQueryTab(tabOptions));

    expect(result.current.value).toBe('partner');
    expect(mockReplace).toHaveBeenCalledWith(
      '/id/support?tab%5Bsupport%5D=partner&status=open',
      { scroll: false }
    );
  });

  it('preserves unrelated query params and resets only owned pagination on push', () => {
    currentParams = new URLSearchParams(
      'tab%5Bsupport%5D=partner&status=open&page%5Bsupport%5D=3&page%5Baudit%5D=9&lang=id'
    );
    const { result } = renderHook(() => useQueryTab(tabOptions));

    act(() => {
      result.current.setValue('team');
    });

    expect(mockPush).toHaveBeenCalledWith(
      '/id/support?tab%5Bsupport%5D=team&status=open&page%5Baudit%5D=9&lang=id',
      { scroll: false }
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('uses replace instead of push when history is replace', () => {
    currentParams = new URLSearchParams('tab%5Bsupport%5D=partner');
    const { result } = renderHook(() =>
      useQueryTab({ ...tabOptions, history: 'replace' })
    );

    act(() => {
      result.current.setValue('hotline');
    });

    expect(mockReplace).toHaveBeenCalledWith(
      '/id/support?tab%5Bsupport%5D=hotline',
      { scroll: false }
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('clears canonical state owned by the selected tab', () => {
    currentParams = new URLSearchParams(
      'tab%5Bsupport%5D=active&filter%5Btickets%5D%5Bstatus%5D=open&page%5Bsupport%5D=3'
    );
    const { result } = renderHook(() =>
      useQueryTab({
        ...tabOptions,
        clearKeys: ['filter[tickets][status]'],
      })
    );

    act(() => {
      result.current.setValue('team');
    });

    expect(mockPush).toHaveBeenCalledWith(
      '/id/support?tab%5Bsupport%5D=team',
      { scroll: false }
    );
  });

  it('removes obsolete keys while canonicalizing the replacement', () => {
    currentParams = new URLSearchParams(
      'channel=team&status=open&page%5Bsupport%5D=4'
    );
    const { result } = renderHook(() =>
      useQueryTab({
        ...tabOptions,
        removeKeys: ['channel'],
      })
    );

    expect(result.current.value).toBe('partner');
    expect(mockReplace).toHaveBeenCalledWith(
      '/id/support?status=open&tab%5Bsupport%5D=partner',
      { scroll: false }
    );
  });
});
