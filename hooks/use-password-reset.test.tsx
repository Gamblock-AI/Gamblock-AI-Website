import { act, renderHook } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { usePasswordReset } from './use-password-reset';

const requests: Array<Record<string, unknown>> = [];
const server = setupServer(
  http.post(
    'http://localhost:8080/v1/auth/password-reset/request',
    async ({ request }) => {
      requests.push((await request.json()) as Record<string, unknown>);
      return HttpResponse.json({ data: { accepted: true } }, { status: 202 });
    }
  ),
  http.post(
    'http://localhost:8080/v1/auth/password-reset/confirm',
    async ({ request }) => {
      requests.push((await request.json()) as Record<string, unknown>);
      return HttpResponse.json({ data: { reset: true } });
    }
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  requests.length = 0;
  server.resetHandlers();
});
afterAll(() => server.close());

describe('usePasswordReset', () => {
  it('uses the public request and confirmation contracts', async () => {
    const { result } = renderHook(() => usePasswordReset());

    await act(() => result.current.requestCode('student@example.com'));
    await act(() =>
      result.current.confirmReset(
        'student@example.com',
        '23456789ABCD',
        'safe-password'
      )
    );

    expect(requests).toEqual([
      { email: 'student@example.com' },
      {
        email: 'student@example.com',
        code: '23456789ABCD',
        new_password: 'safe-password',
      },
    ]);
  });
});
