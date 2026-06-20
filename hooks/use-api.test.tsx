import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { useApiQuery, useApiMutation } from './use-api';

const API = 'http://localhost:8080';
const server = setupServer(
  http.get(`${API}/v1/items`, () =>
    HttpResponse.json({ data: [{ id: 1 }] })
  ),
  http.post(`${API}/v1/items`, () =>
    HttpResponse.json({ data: { id: 2, ok: true } })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useApiQuery', () => {
  it('fetches and exposes data', async () => {
    const { result } = renderHook(() => useApiQuery('/items'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([{ id: 1 }]);
    expect(result.current.error).toBeNull();
  });

  it('does not fetch when autoFetch is false', async () => {
    const { result } = renderHook(() => useApiQuery('/items', false));
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
  });
});

describe('useApiMutation', () => {
  it('mutates and returns data', async () => {
    const { result } = renderHook(() => useApiMutation('/items', 'POST'));
    let out: unknown;
    await act(async () => {
      out = await result.current.mutate({ name: 'x' });
    });
    expect(out).toEqual({ id: 2, ok: true });
    expect(result.current.loading).toBe(false);
  });
});
