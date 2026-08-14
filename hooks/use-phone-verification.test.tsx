import { act, renderHook } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { usePhoneVerification } from './use-phone-verification';

const requests: Array<Record<string, unknown>> = [];
const server = setupServer(
  http.post(
    'http://localhost:8080/v1/auth/phone-verification/verify',
    async ({ request }) => {
      requests.push((await request.json()) as Record<string, unknown>);
      return HttpResponse.json({
        data: {
          access_token: 'access-token',
          refresh_token: 'refresh-token',
          user: { id: 'u1', email: 'a@b.co', role: 'user' },
        },
      });
    }
  ),
  http.post(
    'http://localhost:8080/v1/auth/phone-verification/verify/resend',
    async ({ request }) => {
      requests.push((await request.json()) as Record<string, unknown>);
      return HttpResponse.json({ data: { sent: true, preview_code: '123456' } });
    }
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  requests.length = 0;
  server.resetHandlers();
});
afterAll(() => server.close());

describe('usePhoneVerification', () => {
  it('verifies with the token and code, then resends using only the token', async () => {
    const { result } = renderHook(() => usePhoneVerification());

    await act(() => result.current.verifyCode('verification-token', '123456'));
    let resent: { preview_code?: string } | null = null;
    await act(async () => {
      resent = await result.current.resendCode('verification-token');
    });

    expect(requests).toEqual([
      { verification_token: 'verification-token', code: '123456' },
      { verification_token: 'verification-token' },
    ]);
    expect(resent?.preview_code).toBe('123456');
  });

  it('surfaces a rejected code as an error', async () => {
    server.use(
      http.post(
        'http://localhost:8080/v1/auth/phone-verification/verify',
        () =>
          HttpResponse.json(
            {
              data: null,
              error: {
                code: 'phone_verification_failed',
                message: 'Nomor atau kode verifikasi WhatsApp tidak valid.',
              },
              request_id: 'r1',
            },
            { status: 400 }
          )
      )
    );

    const { result } = renderHook(() => usePhoneVerification());
    await expect(
      act(async () => {
        await result.current.verifyCode('verification-token', '000000');
      })
    ).rejects.toThrow();
  });
});
