import type { Page, Route } from '@playwright/test';

export type MockRole = 'user' | 'partner' | 'admin';

export interface MockApiOptions {
  role?: MockRole;
  authenticated?: boolean;
  seedUser?: boolean;
  onboarding?: boolean;
  recommendationEnabled?: boolean;
  expiredSession?: boolean;
}

export interface MockRequest {
  method: string;
  path: string;
  body: string | undefined;
}

export interface MockApiHandle {
  requests: MockRequest[];
}

const API_HEADERS = {
  'access-control-allow-origin': 'http://localhost:3000',
  'access-control-allow-credentials': 'true',
  'access-control-allow-headers': 'Content-Type, Authorization',
  'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

function todayISO() {
  return new Date().toISOString();
}

function userForRole(role: MockRole) {
  return {
    id: `mock-${role}-001`,
    email: `${role}@example.test`,
    display_name:
      role === 'user'
        ? 'Alya Mahasiswa'
        : role === 'partner'
          ? 'Bima Pendamping'
          : 'Citra Administrator',
    role,
    phone_e164: '+6281200000000',
    phone_verified_at: todayISO(),
  };
}

function progressSnapshot() {
  return {
    weekly_blocks: [0, 1, 0, 2, 0, 1, 0],
    range_days: 7,
    daily_blocks: [0, 1, 0, 2, 0, 1, 0],
    mood_points: [],
    check_in_count: 1,
    trend_available: true,
    active_days: 5,
    reflections: 1,
    data_state: 'synced',
    activity_days: [],
  };
}

function analyticsSummary() {
  return {
    period_days: 14,
    totals: {
      blocked: 4,
      interventions: 2,
      tamper_events: 0,
      permission_revoked: 0,
    },
    daily: [],
    hourly: [],
    data_state: 'synced',
    member_count: 1,
    shared_member_count: 1,
    protected_users: 1,
  };
}

function accountabilityWorkspace() {
  const now = todayISO();
  return {
    role: 'partner',
    groups: [
      {
        id: 'group-demo',
        owner_name: 'Bima Pendamping',
        name: 'Kelompok Demo PKM',
        description: 'Fixture kelompok pendampingan sintetis.',
        join_code_hint: 'DEMO',
        status: 'active',
        member_count: 1,
        code_rotated_at: now,
        created_at: now,
      },
    ],
    members: [
      {
        id: 'membership-demo',
        group_id: 'group-demo',
        student_id: 'student-demo',
        student_name: 'Dina Mahasiswa',
        status: 'active',
        sharing: {
          protection_health: true,
          protection_activity: true,
          recovery_engagement: true,
          education_progress: true,
        },
        aggregate: {
          protection_status: 'ready',
          active_device_count: 1,
          last_heartbeat_bucket: 'today',
          weekly_block_count: 2,
          check_in_days: 3,
          mission_completed: 2,
          education_progress_band: 'in_progress',
        },
        joined_at: now,
      },
    ],
    exit_requests: [],
    contact_requests: [],
    pending_actions: 0,
  };
}

function analyticsMembers() {
  const workspace = accountabilityWorkspace();
  return {
    items: workspace.members,
    total_count: workspace.members.length,
    page: 1,
    page_size: 5,
    total_pages: 1,
    has_more: false,
    total_detections: 2,
    shared_activity_members: 1,
    total_members: 1,
    ready_members: 1,
    attention_members: 0,
    detection_scale_max: 2,
  };
}

function recommendation(enabled: boolean) {
  return {
    recommendation_id: 'mock-recommendation-001',
    recommended_at: todayISO(),
    recommendation_enabled: enabled,
    feature: {
      intervention_key: 'recovery-practice',
      response_type: 'link',
      feature_id: 'recovery_practice',
      category: 'recovery',
      route: '/recovery',
      action: 'practice',
      load: 1,
    },
    support_level: 'MEDIUM',
    support_score: 0.6,
    engagement_level: 'MEDIUM',
    intervention_needed: true,
    reason_code: 'spk_baseline_rule',
    reason: {
      code: 'spk_baseline_rule',
      support_level: 'MEDIUM',
      engagement_level: 'MEDIUM',
      support_score: 0.6,
      factors: [
        {
          key: 'recovery_streak_days',
          score: 1,
          weight_percent: 40,
        },
      ],
    },
    time_trigger: { has_time_pattern: false },
    effectiveness_history_used: false,
    triggered_rules: ['baseline'],
    data_state: 'partial',
    data_gaps: [{ key: 'gap-check-in', action: 'check_in', route: '/recovery' }],
    available_weight_percent: 70,
    unavailable_fields: ['time_pattern'],
    llm_used: false,
  };
}

function educationModules() {
  return [
    {
      id: 'module-demo',
      slug: 'mengenali-pola',
      locale: 'id',
      title: 'Mengenali pola pemulihan',
      summary: 'Materi demo untuk pengujian browser.',
      learning_objective: 'Mengenali langkah kecil.',
      disclaimer: 'Materi edukasi bukan diagnosis.',
      category: 'self-regulation',
      audience: 'student',
      experience_type: 'article',
      estimated_minutes: 5,
      reviewer_name: 'Reviewer Demo',
      reviewer_role: 'Reviewer',
      reviewed_at: todayISO(),
      revision: 1,
      thumbnails: [],
      thumbnail_urls: {},
      videos: [],
      media_urls: {},
      sources: [],
      sections: [],
      progress: {
        completed_section_ids: [],
        opened_media_ids: [],
        correct_check_ids: [],
        progress_percent: 0,
      },
      updated_at: todayISO(),
    },
  ];
}

function dailyMission() {
  return {
    id: 'mission-demo',
    user_id: 'mock-user-001',
    date: todayISO().slice(0, 10),
    tasks: [],
    experience: {
      total_exp: 0,
      level: 1,
      level_progress: 0,
      level_target: 100,
    },
    completed_count: 0,
    resolved_count: 0,
    total_count: 0,
    created_at: todayISO(),
    updated_at: todayISO(),
  };
}

async function fulfillJSON(route: Route, data: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    headers: API_HEADERS,
    body: JSON.stringify({ data }),
  });
}

export async function installMockApi(
  page: Page,
  options: MockApiOptions = {}
): Promise<MockApiHandle> {
  const role = options.role ?? 'user';
  const authenticated = options.authenticated ?? true;
  const seedUser = options.seedUser ?? authenticated;
  const onboarding = options.onboarding ?? false;
  const recommendationEnabled = options.recommendationEnabled ?? false;
  const expiredSession = options.expiredSession ?? false;
  const requests: MockRequest[] = [];
  const checkIn = {
    id: 'checkin-demo',
    mood_score: 4,
    urge_score: 2,
    created_at: todayISO(),
  };
  const intention = {
    id: 'intention-demo',
    intention_text: 'Saya memilih satu langkah kecil hari ini.',
    status: 'active',
    created_at: todayISO(),
    updated_at: todayISO(),
  };
  const preference = {
    spk_recommendation_enabled: recommendationEnabled,
    spk_use_protection: recommendationEnabled,
    spk_use_recovery: recommendationEnabled,
    spk_use_personal: recommendationEnabled,
    llm_personalization_enabled: false,
  };

  await page.route('**/v1/**', async (route) => {
    const request = route.request();
    const requestURL = new URL(request.url());
    const path = requestURL.pathname.replace(/^\/v1/, '') || '/';
    const method = request.method();
    requests.push({ method, path, body: request.postData() ?? undefined });

    if (method === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: API_HEADERS });
      return;
    }

    if (expiredSession && path !== '/auth/refresh') {
      await fulfillJSON(
        route,
        { error: { code: 'invalid_token', message: 'Synthetic expired session' } },
        401
      );
      return;
    }

    if (path === '/auth/login' && method === 'POST') {
      await fulfillJSON(route, {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        token_type: 'Bearer',
        expires_in: 3600,
        user: userForRole(role),
      });
      return;
    }
    if (path === '/auth/refresh' && method === 'POST') {
      await fulfillJSON(route, {
        access_token: 'mock-access-token-refreshed',
        refresh_token: 'mock-refresh-token-refreshed',
        expires_in: 3600,
      });
      return;
    }
    if (path === '/me') {
      if (expiredSession) {
        await fulfillJSON(route, { error: { code: 'invalid_token' } }, 401);
      } else {
        await fulfillJSON(route, userForRole(role));
      }
      return;
    }
    if (path === '/client/dashboard-summary') {
      await fulfillJSON(route, {
        user_name: userForRole(role).display_name,
        protection_label: 'Aktif',
        blocked_attempts: 4,
        active_days: 5,
        current_streak: 3,
        data_state: 'synced',
      });
      return;
    }
    if (path === '/client/protection-status') {
      await fulfillJSON(route, {
        mode: 'active',
        runtime_status: 'protected',
        ruleset_version: 'mock-ruleset',
        model_version: 'mock-model',
        device_count: 1,
      });
      return;
    }
    if (path === '/client/progress') {
      await fulfillJSON(route, progressSnapshot());
      return;
    }
    if (path === '/psychoeducation/modules') {
      await fulfillJSON(route, educationModules());
      return;
    }
    if (path === '/missions/today') {
      await fulfillJSON(route, dailyMission());
      return;
    }
    if (path === '/intentions') {
      if (method === 'GET') {
        await fulfillJSON(route, onboarding ? {} : intention);
      } else {
        await fulfillJSON(route, intention);
      }
      return;
    }
    if (path === '/check-ins') {
      if (method === 'GET') {
        await fulfillJSON(route, onboarding ? [] : [checkIn]);
      } else {
        await fulfillJSON(route, checkIn);
      }
      return;
    }
    if (path === '/client/spk-recommendation') {
      await fulfillJSON(route, recommendation(recommendationEnabled));
      return;
    }
    if (path === '/client/spk-preference') {
      if (method === 'PUT') {
        const body = request.postDataJSON() as Partial<typeof preference> | null;
        Object.assign(preference, body ?? {});
      }
      await fulfillJSON(route, preference);
      return;
    }
    if (path === '/me/reminder-preference') {
      await fulfillJSON(route, {
        enabled: false,
        local_time: '19:00',
        timezone: 'Asia/Jakarta',
        locale: 'id',
      });
      return;
    }
    if (path === '/recovery-space') {
      await fulfillJSON(route, {
        id: 'space-demo',
        theme: 'sunrise_study',
        unlocked_items: [],
        placed_items: {},
        unlock_rule_version: 1,
        updated_at: todayISO(),
      });
      return;
    }
    if (path === '/recovery-practices') {
      await fulfillJSON(route, []);
      return;
    }
    if (path === '/weekly-reviews/current') {
      await fulfillJSON(route, null);
      return;
    }
    if (path === '/accountability/workspace') {
      await fulfillJSON(route, accountabilityWorkspace());
      return;
    }
    if (path === '/approval-requests') {
      await fulfillJSON(route, []);
      return;
    }
    if (path === '/accountability/analytics/members') {
      await fulfillJSON(route, analyticsMembers());
      return;
    }
    if (path === '/accountability/analytics') {
      await fulfillJSON(route, analyticsSummary());
      return;
    }
    if (path === '/admin/overview') {
      await fulfillJSON(route, {
        role: 'admin',
        draft_content: 0,
        review_content: 0,
        open_support: 0,
        unassigned_support: 0,
        failed_data_requests: 0,
        pending_emergency: 0,
        active_operators: 1,
        visible_social_links: 0,
      });
      return;
    }
    if (path === '/admin/analytics') {
      await fulfillJSON(route, analyticsSummary());
      return;
    }

    if (method === 'GET') {
      await fulfillJSON(route, []);
    } else {
      await fulfillJSON(route, {});
    }
  });

  if (authenticated) {
    await page.context().addCookies([
      {
        name: 'gamblock_access_token',
        value: 'mock-access-token',
        domain: 'localhost',
        path: '/',
      },
    ]);
  }

  await page.addInitScript(
    ({
      authenticated: initialAuthenticated,
      seedUser: initialSeedUser,
      user,
      recommendationEnabled: initialRecommendationEnabled,
    }) => {
      if (!initialAuthenticated) return;
      window.localStorage.setItem(
        'gamblock_access_token',
        'mock-access-token'
      );
      window.localStorage.setItem(
        'gamblock_refresh_token',
        'mock-refresh-token'
      );
      if (initialSeedUser) {
        window.localStorage.setItem('gamblock_user', JSON.stringify(user));
      }
      window.localStorage.setItem('gamblock:dashboard-tour:v1', '1');
      window.localStorage.setItem('gamblock:partner-tour:v1', '1');
      window.localStorage.setItem('gamblock:admin-tour:v1', '1');
      if (!initialRecommendationEnabled) {
        window.localStorage.setItem(
          'gamblock:gami-recommendation:last-seen-id:v1',
          'mock-recommendation-001'
        );
      }
    },
    {
      authenticated,
      seedUser,
      user: userForRole(role),
      recommendationEnabled,
    }
  );

  return { requests };
}
