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
  mission_1: false,
  mission_2: false,
  mission_3: false,
  mission_4: false,
  mission_5: false,
  tasks: [
    {
      number: 1,
      key: 'mission_1',
      role: 'primary',
      completed: false,
      claimable: false,
      status: 'locked',
      verification_key: 'active_protection_today',
      exp_reward: 10,
    },
    {
      number: 2,
      key: 'mission_2',
      role: 'bonus',
      completed: false,
      claimable: false,
      status: 'locked',
      verification_key: 'daily_check_in',
      exp_reward: 10,
    },
    {
      number: 3,
      key: 'mission_3',
      role: 'bonus',
      completed: false,
      claimable: false,
      status: 'locked',
      verification_key: 'education_section_today',
      exp_reward: 20,
    },
  ],
  experience: { total_exp: 0, level: 1, level_progress: 0, level_target: 100 },
  completed_count: 0,
  resolved_count: 0,
  total_count: 3,
  replacement_options: [4, 5],
  created_at: '2026-07-19T00:00:00Z',
  updated_at: '2026-07-19T00:00:00Z',
};

const server = setupServer(
  http.get(`${API}/v1/missions/today`, () =>
    HttpResponse.json({ data: initialMission })
  ),
  http.post(`${API}/v1/missions/adjust`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    expect(body).toEqual({
      mission_number: 1,
      action: 'replace',
      reason: 'not_a_good_fit',
      replacement_number: 4,
    });
    return HttpResponse.json({
      data: {
        ...initialMission,
        replacement_options: [],
        adjustment: {
          original_number: 1,
          action: 'replace',
          reason: 'not_a_good_fit',
          replacement_number: 4,
          adjusted_at: '2026-07-19T01:00:00Z',
        },
        tasks: [
          {
            ...initialMission.tasks[0],
            number: 4,
            key: 'mission_4',
            verification_key: 'active_partner',
            replaced_from: 1,
          },
          initialMission.tasks[1],
          initialMission.tasks[2],
        ],
      },
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useDailyMission', () => {
  it('replaces the primary mission through the adjustment contract', async () => {
    const { result } = renderHook(() => useDailyMission());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      const saved = await result.current.adjustMission({
        missionNumber: 1,
        action: 'replace',
        reason: 'not_a_good_fit',
        replacementNumber: 4,
      });
      expect(saved).toBe(true);
    });

    expect(result.current.items[0].number).toBe(4);
    expect(result.current.items[0].replacedFrom).toBe(1);
    expect(result.current.mission?.replacement_options).toEqual([]);
  });
});
