import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

import { proxy } from './proxy';

// next-intl's middleware imports Next's server entry as an external dependency
// in Vitest. The proxy tests target this file's redirect policy; locale routing
// itself remains covered by the browser E2E suite.
vi.mock('next-intl/middleware', () => ({
  default: () => () => ({}),
}));

vi.mock('@/i18n/routing', () => ({
  routing: {
    locales: ['id', 'en'],
    defaultLocale: 'id',
  },
}));

function makeRequest(path: string, token?: string) {
  return new NextRequest(`http://localhost${path}`, {
    headers: token ? { cookie: `gamblock_access_token=${token}` } : undefined,
  });
}

function redirectURL(response: Response) {
  expect(response.status).toBe(307);

  const location = response.headers.get('location');
  expect(location).toBeTruthy();
  return new URL(location!);
}

describe('proxy route protection', () => {
  it('redirects an unauthenticated default-locale protected route to login', () => {
    const response = proxy(makeRequest('/dashboard?tab=overview'));
    const location = redirectURL(response);

    expect(location.pathname).toBe('/id/login');
    expect(location.searchParams.get('next')).toBe('/dashboard?tab=overview');
  });

  it('preserves the requested locale for an unauthenticated protected route', () => {
    const response = proxy(makeRequest('/en/recovery'));
    const location = redirectURL(response);

    expect(location.pathname).toBe('/en/login');
    expect(location.searchParams.get('next')).toBe('/recovery');
  });

  it('redirects an authenticated guest route to a safe in-app destination', () => {
    const response = proxy(makeRequest('/id/login?next=%2Frecovery', 'test-token'));
    const location = redirectURL(response);

    expect(location.pathname).toBe('/id/recovery');
    expect(location.search).toBe('');
  });

  it('falls back to the dashboard for an external guest redirect target', () => {
    const response = proxy(
      makeRequest('/en/register?next=https%3A%2F%2Fexample.com', 'test-token')
    );
    const location = redirectURL(response);

    expect(location.pathname).toBe('/en/dashboard');
    expect(location.search).toBe('');
  });

  it('redirects the legacy progress route to the locale recovery hub', () => {
    const response = proxy(makeRequest('/en/progress?tab=history'));
    const location = redirectURL(response);

    expect(location.pathname).toBe('/en/recovery');
    expect(location.search).toBe('?tab=history');
  });

  it('normalizes legacy query keys before applying route protection', () => {
    const response = proxy(
      makeRequest('/id/dashboard?tab%5Bsupport%5D=partner')
    );
    const location = redirectURL(response);

    expect(location.pathname).toBe('/id/dashboard');
    expect(location.searchParams.get('tab.support')).toBe('partner');
    expect(location.searchParams.get('next')).toBeNull();
  });
});
