import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';
import recoveryMessages from '@/messages/id/recovery.json';
import type {
  AccountabilityGroup,
  AccountabilityMembership,
} from '@/hooks/use-accountability';
import { PartnerAnalyticsPanel } from './partner-analytics-panel';

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

const members: AccountabilityMembership[] = [
  {
    id: 'member-a',
    group_id: 'group-a',
    student_id: 'student-a',
    student_name: 'Alya',
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
      weekly_block_count: 5,
      check_in_days: 4,
      mission_completed: 8,
      education_progress_band: 'in_progress',
    },
    joined_at: '2026-08-02T00:00:00Z',
  },
  {
    id: 'member-b',
    group_id: 'group-a',
    student_id: 'student-b',
    student_name: 'Bima',
    status: 'active',
    sharing: {
      protection_health: false,
      protection_activity: false,
      recovery_engagement: false,
      education_progress: false,
    },
    aggregate: {},
    joined_at: '2026-08-02T00:00:00Z',
  },
];

describe('PartnerAnalyticsPanel', () => {
  it('renders accessible filters, desktop table, mobile cards, and consent states', () => {
    render(
      <NextIntlClientProvider locale="id" messages={recoveryMessages}>
        <PartnerAnalyticsPanel groups={groups} members={members} />
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
    expect(screen.getAllByText('Alya')).toHaveLength(2);
    expect(screen.getAllByText('Bima')).toHaveLength(2);
    expect(screen.getAllByText('Tidak dibagikan').length).toBeGreaterThan(1);
    expect(
      screen.getByText(/tidak membuktikan niat mahasiswa/i)
    ).toBeInTheDocument();
  });
});
