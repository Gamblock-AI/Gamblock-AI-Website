import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  vi,
} from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { NextIntlClientProvider } from 'next-intl';
import type { PropsWithChildren } from 'react';
import accountabilityMessages from '@/messages/id/accountability.json';

// Swal and sonner touch the DOM at call time; mock them to keep jsdom clean.
vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn().mockResolvedValue({ isConfirmed: false }) },
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { useAccountability } from './use-accountability';

function IntlTestProvider({ children }: PropsWithChildren) {
  return (
    <NextIntlClientProvider locale="id" messages={accountabilityMessages}>
      {children}
    </NextIntlClientProvider>
  );
}

const API = 'http://localhost:8080';
const server = setupServer(
  http.get(`${API}/v1/accountability/workspace`, () =>
    HttpResponse.json({
      data: {
        role: 'user',
        groups: [
          {
            id: 'grp_1',
            owner_name: 'Suci',
            name: 'Pendamping',
            description: '',
            join_code_hint: '4567',
            status: 'active',
            member_count: 1,
            code_rotated_at: '2026-06-19T00:00:00Z',
            created_at: '2026-06-19T00:00:00Z',
          },
        ],
        membership: {
          id: 'mbr_1',
          group_id: 'grp_1',
          student_id: 'usr_1',
          student_name: 'Gading',
          status: 'active',
          sharing: {
            protection_health: true,
            protection_activity: true,
            recovery_engagement: true,
            education_progress: true,
          },
          aggregate: {},
          joined_at: '2026-06-19T00:00:00Z',
        },
        members: [],
        exit_requests: [],
        contact_requests: [],
        pending_actions: 0,
      },
    })
  ),
  http.get(`${API}/v1/approval-requests`, () =>
    HttpResponse.json({
      data: [
        {
          id: 'APR-1',
          action: 'pause',
          status: 'pending',
          reason: 'x',
          created_at: '2026-06-19T00:00:00Z',
        },
      ],
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useAccountability', () => {
  it('loads active partner and approval requests', async () => {
    const { result } = renderHook(() => useAccountability(), {
      wrapper: IntlTestProvider,
    });
    await waitFor(() =>
      expect(result.current.workspace.membership?.status).toBe('active')
    );
    expect(result.current.workspace.groups[0].owner_name).toBe('Suci');
    await waitFor(() => expect(result.current.requests.length).toBe(1));
    expect(result.current.requests[0].id).toBe('APR-1');
  });

  it('exposes partner controls without a student web request modal', async () => {
    const { result } = renderHook(() => useAccountability(), {
      wrapper: IntlTestProvider,
    });
    await waitFor(() =>
      expect(result.current.workspace.membership?.status).toBe('active')
    );
    expect(typeof result.current.updateSharing).toBe('function');
    expect(typeof result.current.requestLeave).toBe('function');
  });
});
