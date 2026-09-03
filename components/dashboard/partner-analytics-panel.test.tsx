import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';
import recoveryMessages from '@/messages/id/recovery.json';
import type {
  AccountabilityGroup,
} from '@/hooks/use-accountability';
import { PartnerAnalyticsPanel } from './partner-analytics-panel';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/hooks/use-paginated-query', () => ({
  usePaginatedQuery: () => {
    const member = {
      id: 'membership-a',
      group_id: 'group-a',
      student_id: 'student-a',
      student_name: 'Mahasiswa Alpha',
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
      joined_at: '2026-08-02T00:00:00Z',
    };

    return {
      items: [member],
      data: {
        items: [member],
        total_count: 1,
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
      },
      pagination: {
        page: 1,
        totalPages: 1,
        totalItems: 1,
        pageSize: 5,
        startIndex: 1,
        endIndex: 1,
        hasNextPage: false,
        hasPrevPage: false,
        setPage: vi.fn(),
        resetPage: vi.fn(),
        nextPage: vi.fn(),
        prevPage: vi.fn(),
        goToFirstPage: vi.fn(),
        goToLastPage: vi.fn(),
        items: [member],
      },
      loading: false,
      error: null,
      refetch: vi.fn(async () => null),
    };
  },
}));

const groups: AccountabilityGroup[] = [
  {
    id: 'group-a',
    owner_name: 'Partner',
    name: 'Kelompok Alpha',
    description: '',
    join_code_hint: 'DEMO',
    status: 'active',
    member_count: 2,
    code_rotated_at: '2026-08-02T00:00:00Z',
    created_at: '2026-08-02T00:00:00Z',
  },
];

describe('PartnerAnalyticsPanel', () => {
  it('renders accessible filters, desktop table, mobile cards, and consent states', () => {
    render(
      <NextIntlClientProvider locale="id" messages={recoveryMessages}>
        <PartnerAnalyticsPanel
          groups={groups}
          selectedGroupID="all"
          onSelectedGroupIDChange={() => {}}
        />
      </NextIntlClientProvider>
    );

    expect(
      screen.getByRole('combobox', { name: 'Grup pendampingan' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('searchbox', { name: 'Cari mahasiswa' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('table', {
        name: 'Analitik agregat per mahasiswa untuk tujuh hari terakhir',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/tidak membuktikan niat mahasiswa/i)
    ).toBeInTheDocument();
  });
});
