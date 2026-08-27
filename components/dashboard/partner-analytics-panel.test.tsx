import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';
import recoveryMessages from '@/messages/id/recovery.json';
import type {
  AccountabilityGroup,
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
