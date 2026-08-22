import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient, reauthenticate } from './api-client';
import { ApiError } from './api-error';
import * as reauthModule from './reauth';

describe('api-client reauthenticate and recent-auth', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('reauthenticate successfully stores tokens on valid password', async () => {
    localStorage.setItem('gamblock_access_token', 'valid-access-token');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expires_in: 3600,
        },
      }),
    });
    global.fetch = mockFetch;

    await reauthenticate('correct-password');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/auth/reauthenticate'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer valid-access-token',
        }),
        body: JSON.stringify({ password: 'correct-password' }),
      })
    );

    expect(localStorage.getItem('gamblock_access_token')).toBe('new-access-token');
    expect(localStorage.getItem('gamblock_refresh_token')).toBe('new-refresh-token');
  });

  it('reauthenticate auto-refreshes access token if expired and retries reauthenticate', async () => {
    localStorage.setItem('gamblock_access_token', 'expired-access-token');
    localStorage.setItem('gamblock_refresh_token', 'valid-refresh-token');

    let reauthCallCount = 0;
    const mockFetch = vi.fn(async (url: string) => {
      if (url.includes('/v1/auth/reauthenticate')) {
        reauthCallCount++;
        if (reauthCallCount === 1) {
          // First attempt returns 401 invalid_token
          return {
            ok: false,
            status: 401,
            json: async () => ({
              error: { code: 'invalid_token', message: 'Token is expired' },
            }),
            clone() {
              return this;
            },
          };
        }
        // Second attempt with refreshed token succeeds
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              access_token: 'brand-new-recent-access-token',
              refresh_token: 'brand-new-recent-refresh-token',
              expires_in: 3600,
            },
          }),
        };
      }

      if (url.includes('/v1/auth/refresh')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              access_token: 'refreshed-access-token',
              refresh_token: 'refreshed-refresh-token',
              expires_in: 3600,
            },
          }),
        };
      }

      return {
        ok: true,
        status: 200,
        json: async () => ({ data: {} }),
      };
    });

    global.fetch = mockFetch as unknown as typeof fetch;

    await reauthenticate('correct-password');

    // 1st reauth (with expired token) -> refresh -> 2nd reauth (with refreshed token)
    expect(reauthCallCount).toBe(2);
    expect(localStorage.getItem('gamblock_access_token')).toBe(
      'brand-new-recent-access-token'
    );
  });

  it('reauthenticate throws invalid_credentials on wrong password', async () => {
    localStorage.setItem('gamblock_access_token', 'valid-access-token');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        error: { code: 'invalid_credentials', message: 'invalid credentials' },
      }),
      clone() {
        return this;
      },
    });
    global.fetch = mockFetch;

    await expect(reauthenticate('wrong-password')).rejects.toThrow(ApiError);
  });

  it('apiClient triggers requestReauth when receiving recent_auth_required and retries with new token', async () => {
    localStorage.setItem('gamblock_access_token', 'old-auth-time-token');

    const requestReauthSpy = vi
      .spyOn(reauthModule, 'requestReauth')
      .mockImplementation(async () => {
        localStorage.setItem('gamblock_access_token', 'fresh-recent-token');
        return true;
      });

    let attempt = 0;
    const mockFetch = vi.fn(async () => {
      attempt++;
      if (attempt === 1) {
        return {
          ok: false,
          status: 401,
          json: async () => ({
            error: {
              code: 'recent_auth_required',
              message: 'recent auth required',
            },
          }),
          clone() {
            return this;
          },
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          data: { status: 'account_disabled' },
        }),
      };
    });

    global.fetch = mockFetch as unknown as typeof fetch;

    const result = await apiClient<{ status: string }>('/admin/accounts/acc_123', {
      method: 'PATCH',
      body: JSON.stringify({ disabled: true }),
    });

    expect(requestReauthSpy).toHaveBeenCalledTimes(1);
    expect(attempt).toBe(2);
    expect(result).toEqual({ status: 'account_disabled' });
  });
});
