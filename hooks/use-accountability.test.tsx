import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Swal and sonner touch the DOM at call time; mock them to keep jsdom clean.
vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn().mockResolvedValue({ isConfirmed: false }) },
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { useAccountability } from './use-accountability';

const API = 'http://localhost:8080';
const server = setupServer(
  http.get(`${API}/v1/partners`, () =>
    HttpResponse.json({
      data: {
        active_partner: { id: 'pl_1', partner_email: 'suci@gmail.com', status: 'active' },
        items: [],
      },
    })
  ),
  http.get(`${API}/v1/approval-requests`, () =>
    HttpResponse.json({ data: [{ id: 'APR-1', action: 'pause', status: 'pending', reason: 'x', created_at: '2026-06-19T00:00:00Z' }] })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useAccountability', () => {
  it('loads active partner and approval requests', async () => {
    const { result } = renderHook(() => useAccountability());
    await waitFor(() => expect(result.current.partnerStatus).toBe('active'));
    expect(result.current.partnerEmail).toBe('suci@gmail.com');
    expect(result.current.partnerLinkId).toBe('pl_1');
    await waitFor(() => expect(result.current.requests.length).toBe(1));
    expect(result.current.requests[0].id).toBe('APR-1');
  });

  it('exposes partner controls without a student web request modal', async () => {
    const { result } = renderHook(() => useAccountability());
    await waitFor(() => expect(result.current.partnerStatus).toBe('active'));
    expect(typeof result.current.handleInvitePartner).toBe('function');
    expect(result.current).not.toHaveProperty('setIsModalOpen');
    expect(result.current).not.toHaveProperty('isModalOpen');
  });
});
