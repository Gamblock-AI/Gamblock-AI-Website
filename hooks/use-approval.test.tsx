import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { useApprovalVerification, useResolveApproval } from './use-approval';

const API = 'http://localhost:8080';
const server = setupServer(
  http.get(`${API}/v1/approval-requests/verify/:token`, ({ params }) => {
    if (params.token === 'good') {
      return HttpResponse.json({
        data: {
          request_id: 'APR-1',
          action: 'pause_protection',
          reason: 'troubleshooting',
          requested_duration_minutes: 30,
          status: 'pending',
          created_at: '2026-06-19T00:00:00Z',
        },
      });
    }
    return HttpResponse.json(
      {
        data: null,
        error: {
          code: 'invalid_token',
          message: 'Token tidak valid atau sudah kadaluarsa.',
        },
      },
      { status: 404 }
    );
  }),
  http.post(`${API}/v1/approval-requests/:id/resolve-by-token`, () =>
    HttpResponse.json({ data: { resolved: true } })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useApprovalVerification', () => {
  it('loads details for a valid token', async () => {
    const { result } = renderHook(() => useApprovalVerification('good'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.details?.request_id).toBe('APR-1');
    expect(result.current.error).toBeNull();
  });

  it('surfaces error for an invalid token', async () => {
    const { result } = renderHook(() => useApprovalVerification('bad'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.details).toBeNull();
    expect(result.current.error).toBe('invalid_token');
  });

  it('errors immediately when token is null', async () => {
    const { result } = renderHook(() => useApprovalVerification(null));
    expect(result.current.error).toBe('missing_token');
    expect(result.current.loading).toBe(false);
  });
});

describe('useResolveApproval', () => {
  it('resolves successfully', async () => {
    const { result } = renderHook(() => useResolveApproval('APR-1', 'good'));
    let ok = false;
    await act(async () => {
      ok = await result.current.resolve('approved');
    });
    expect(ok).toBe(true);
    expect(result.current.submitting).toBe(false);
  });
});
