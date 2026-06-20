import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { useProgressData } from './use-progress-data';

const API = 'http://localhost:8080';
const server = setupServer(
  http.get(`${API}/v1/client/progress`, () =>
    HttpResponse.json({
      data: { weekly_blocks: [1, 2, 3, 4, 5, 6, 7], moods: ['baik'], active_days: 7, reflections: 2 },
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useProgressData', () => {
  it('loads progress snapshot', async () => {
    const { result } = renderHook(() => useProgressData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.progress?.weekly_blocks).toHaveLength(7);
    expect(result.current.completedCount).toBe(0);
  });

  it('toggleCheck flips a mission', async () => {
    const { result } = renderHook(() => useProgressData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.toggleCheck(0));
    expect(result.current.checked[0]).toBe(true);
    expect(result.current.completedCount).toBe(1);
  });
});
