import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { useDailyMission, type DailyMission } from './use-daily-mission';

const API = 'http://localhost:8080';
const initialMission: DailyMission = {
  id: 'day_2026-07-19',
  user_id: 'usr_student',
  date: '2026-07-19',
  tasks: [
    {
      id: 'system:1', number: 1, key: 'mission_1', source: 'system',
      system_key: 'active_protection_today', completed: false, claimable: false,
      status: 'locked', claim_mode: 'verified', verification_key: 'active_protection_today', exp_reward: 10,
    },
    {
      id: 'system:2', number: 2, key: 'mission_2', source: 'system',
      system_key: 'daily_check_in', completed: false, claimable: false,
      status: 'locked', claim_mode: 'verified', verification_key: 'daily_check_in', exp_reward: 10,
    },
    {
      id: 'system:3', number: 3, key: 'mission_3', source: 'system',
      system_key: 'education_section_today', completed: false, claimable: false,
      status: 'locked', claim_mode: 'verified', verification_key: 'education_section_today', exp_reward: 10,
    },
    {
      id: 'system:5', number: 5, key: 'mission_5', source: 'system',
      system_key: 'education_module_today', completed: false, claimable: false,
      status: 'locked', claim_mode: 'verified', verification_key: 'education_module_today', exp_reward: 10,
    },
  ],
  experience: { total_exp: 0, level: 1, level_progress: 0, level_target: 100 },
  completed_count: 0,
  resolved_count: 0,
  total_count: 4,
  created_at: '2026-07-19T00:00:00Z',
  updated_at: '2026-07-19T00:00:00Z',
};

const server = setupServer(
  http.get(`${API}/v1/missions/today`, () => HttpResponse.json({ data: initialMission })),
  http.post(`${API}/v1/missions/custom`, async ({ request }) => {
    expect(await request.json()).toEqual({ title: 'Walk after class' });
    return HttpResponse.json({
      data: {
        ...initialMission,
        tasks: [
          {
            id: 'mis_custom', key: 'custom_mis_custom', source: 'custom',
            title: 'Walk after class', completed: false, claimable: true,
            status: 'pending', claim_mode: 'self_attested', exp_reward: 10,
          },
          ...initialMission.tasks.slice(0, 4),
        ],
      },
    });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useDailyMission', () => {
  it('creates a private custom mission through the daily-mission contract', async () => {
    const { result } = renderHook(() => useDailyMission());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      expect(await result.current.createCustomMission('Walk after class')).toBe(true);
    });

    expect(result.current.items).toHaveLength(5);
    expect(result.current.items[0]).toMatchObject({
      source: 'custom',
      title: 'Walk after class',
      claim_mode: 'self_attested',
    });
  });
});
