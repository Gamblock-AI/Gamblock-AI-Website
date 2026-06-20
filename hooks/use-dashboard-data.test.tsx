import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { useDashboardData } from './use-dashboard-data';

const API = 'http://localhost:8080';
const server = setupServer(
  http.get(`${API}/v1/client/dashboard-summary`, () =>
    HttpResponse.json({
      data: {
        user_name: 'Gading',
        protection_label: 'active',
        blocked_attempts: 5,
        active_days: 3,
        current_streak: 2,
      },
    })
  ),
  http.get(`${API}/v1/client/protection-status`, () =>
    HttpResponse.json({
      data: {
        mode: 'Active',
        runtime_status: 'ready',
        ruleset_version: 'r1',
        model_version: 'm1',
        last_sync: 'now',
      },
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useDashboardData', () => {
  it('loads summary and protection status', async () => {
    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.summary?.user_name).toBe('Gading');
    expect(result.current.protectionStatus?.mode).toBe('Active');
    expect(result.current.error).toBeNull();
  });
});
