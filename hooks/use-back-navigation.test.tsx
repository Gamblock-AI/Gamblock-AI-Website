import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  recordRoute,
  resolveBackTarget,
  findBackTarget,
  syncStackOnPop,
  useBackNavigation,
  DEFAULT_EXCLUDED_ROUTES,
  type BackNavigationEntry,
  type UseBackNavigationOptions,
} from './use-back-navigation';

const STORAGE_KEY = 'gamblock:back-navigation-stack';

const mockPush = vi.hoisted(() => vi.fn());
const mockBack = vi.hoisted(() => vi.fn());
const mockPathname = vi.hoisted(() => vi.fn(() => '/id/dashboard'));

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: mockBack,
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

function seedStack(entries: BackNavigationEntry[]) {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function readStack(): BackNavigationEntry[] {
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as BackNavigationEntry[]) : [];
}

const current: BackNavigationEntry = { pathname: '/dashboard', search: '' };

beforeEach(() => {
  window.sessionStorage.clear();
  mockPathname.mockReturnValue('/id/dashboard');
  mockPush.mockClear();
  mockBack.mockClear();
  Object.defineProperty(window.history, 'length', { value: 1, configurable: true });
});

describe('recordRoute', () => {
  it('stacks distinct routes and preserves the query string', () => {
    recordRoute('/dashboard', '');
    recordRoute('/education', '?cat=abc&page=2');
    expect(readStack()).toEqual([
      { pathname: '/dashboard', search: '' },
      { pathname: '/education', search: '?cat=abc&page=2' },
    ]);
  });

  it('updates the entry in place for same-pathname query changes', () => {
    recordRoute('/admin/tickets', '');
    recordRoute('/admin/tickets', '?status=open');
    expect(readStack()).toEqual([
      { pathname: '/admin/tickets', search: '?status=open' },
    ]);
  });
});

describe('resolveBackTarget', () => {
  it('returns the exact previous route with full query params', () => {
    seedStack([
      { pathname: '/dashboard', search: '' },
      { pathname: '/education', search: '?cat=abc' },
      { pathname: '/education/slug-1', search: '' },
    ]);
    const result = resolveBackTarget(
      { pathname: '/education/slug-1', search: '' },
      DEFAULT_EXCLUDED_ROUTES
    );
    expect(result.target).toEqual({
      pathname: '/education',
      search: '?cat=abc',
    });
    // The consumed current page is dropped; the target stays as the new top so
    // the next back can walk one step further.
    expect(readStack()).toEqual([
      { pathname: '/dashboard', search: '' },
      { pathname: '/education', search: '?cat=abc' },
    ]);
  });

  it('skips excluded guest routes (login) after authentication', () => {
    seedStack([
      { pathname: '/', search: '' },
      { pathname: '/login', search: '?next=%2Fdashboard' },
      { pathname: '/dashboard', search: '' },
    ]);
    const result = resolveBackTarget(current, DEFAULT_EXCLUDED_ROUTES);
    expect(result.target).toEqual({ pathname: '/', search: '' });
    expect(result.dodgedExcluded).toBe(true);
  });

  it('reports dodgedExcluded when only excluded pages precede current', () => {
    seedStack([
      { pathname: '/login', search: '?next=%2Fdashboard' },
      { pathname: '/dashboard', search: '' },
    ]);
    const result = resolveBackTarget(current, DEFAULT_EXCLUDED_ROUTES);
    expect(result.target).toBeNull();
    expect(result.dodgedExcluded).toBe(true);
  });

  it('returns null when there is no previous entry', () => {
    seedStack([{ pathname: '/dashboard', search: '' }]);
    const result = resolveBackTarget(current, DEFAULT_EXCLUDED_ROUTES);
    expect(result.target).toBeNull();
    expect(result.dodgedExcluded).toBe(false);
  });
});

describe('findBackTarget', () => {
  it('finds the nearest non-excluded previous entry without mutating', () => {
    seedStack([
      { pathname: '/', search: '' },
      { pathname: '/login', search: '' },
      { pathname: '/dashboard', search: '' },
    ]);
    const target = findBackTarget(current, DEFAULT_EXCLUDED_ROUTES);
    expect(target).toEqual({ pathname: '/', search: '' });
    expect(readStack()).toHaveLength(3);
  });
});

describe('syncStackOnPop', () => {
  it('drops the forward tail after a native browser back', () => {
    seedStack([
      { pathname: '/dashboard', search: '' },
      { pathname: '/education', search: '?cat=abc' },
      { pathname: '/education/slug-1', search: '' },
    ]);
    syncStackOnPop('/education', '?cat=abc');
    expect(readStack()).toEqual([
      { pathname: '/dashboard', search: '' },
      { pathname: '/education', search: '?cat=abc' },
    ]);
  });

  it('leaves the stack untouched when the location is not tracked', () => {
    seedStack([
      { pathname: '/dashboard', search: '' },
      { pathname: '/education/slug-1', search: '' },
    ]);
    syncStackOnPop('/external', '');
    expect(readStack()).toHaveLength(2);
  });
});

describe('useBackNavigation', () => {
  function render(options?: UseBackNavigationOptions) {
    return renderHook(() => useBackNavigation(options));
  }

it('routes back to the exact previous page with query params', () => {
    mockPathname.mockReturnValue('/id/skills/react');
    seedStack([
      { pathname: '/dashboard', search: '' },
      { pathname: '/education', search: '?cat=abc' },
      { pathname: '/skills/react', search: '' },
    ]);
    const { result } = render();
    act(() => result.current.goBack());
    expect(mockPush).toHaveBeenCalledWith('/id/education?cat=abc');
  });

  it('uses the caller fallback when there is no previous history', () => {
    seedStack([{ pathname: '/dashboard', search: '' }]);
    const { result } = render({ fallbackHref: '/settings' });
    act(() => result.current.goBack());
    expect(mockPush).toHaveBeenCalledWith('/id/settings');
  });

  it('does not double-prefix an already-locale-prefixed fallback', () => {
    seedStack([{ pathname: '/dashboard', search: '' }]);
    const { result } = render({ fallbackHref: '/id' });
    act(() => result.current.goBack());
    expect(mockPush).toHaveBeenCalledWith('/id');
  });

  it('falls back (never browser-back) when the only history is the login page', () => {
    seedStack([
      { pathname: '/login', search: '?next=%2Fdashboard' },
      { pathname: '/dashboard', search: '' },
    ]);
    const { result } = render();
    act(() => result.current.goBack());
    expect(mockPush).toHaveBeenCalledWith('/id');
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('uses native browser back when there is untracked browser history', () => {
    Object.defineProperty(window.history, 'length', {
      value: 3,
      configurable: true,
    });
    seedStack([{ pathname: '/dashboard', search: '' }]);
    const { result } = render();
    act(() => result.current.goBack());
    expect(mockBack).toHaveBeenCalled();
  });

  it('exposes canGoBack based on a previous safe entry or native history', () => {
    seedStack([
      { pathname: '/', search: '' },
      { pathname: '/dashboard', search: '' },
    ]);
    const { result } = render();
    expect(result.current.canGoBack()).toBe(true);

    window.sessionStorage.clear();
    Object.defineProperty(window.history, 'length', {
      value: 1,
      configurable: true,
    });
    expect(result.current.canGoBack()).toBe(false);
  });
});