import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NiatPerubahanGate } from './niat-perubahan-gate';

const mocks = vi.hoisted(() => ({
  apiClient: vi.fn(),
}));

vi.mock('@/lib/api-client', () => ({
  apiClient: (...args: unknown[]) => mocks.apiClient(...args),
}));

vi.mock('@/hooks/use-local-user', () => ({
  useLocalUser: () => ({ role: 'user' }),
}));

vi.mock('@/hooks/use-recovery-journey', () => ({
  useRecoveryJourney: () => ({ todayCheckIn: true }),
}));

vi.mock('./niat-perubahan-modal', () => ({
  NiatPerubahanModal: ({ onCompleted }: { onCompleted: () => void }) => (
    <div role="dialog" aria-label="Niat Perubahan">
      <button type="button" onClick={onCompleted}>
        Selesaikan niat
      </button>
    </div>
  ),
}));

vi.mock('@/components/dashboard/tour/dashboard-tour', () => ({
  DashboardTour: ({ onSettled }: { onSettled: () => void }) => (
    <div role="dialog" aria-label="Dashboard tour">
      <button type="button" onClick={onSettled}>
        Selesaikan tour
      </button>
    </div>
  ),
}));

vi.mock('./gami-daily-recommendation', () => ({
  GamiDailyRecommendation: ({ studentName }: { studentName: string }) => (
    <div data-testid="gami-recommendation">Gami untuk {studentName}</div>
  ),
}));

describe('NiatPerubahanGate presentation queue', () => {
  it('shows Niat Perubahan, then the tour, then Gami without overlap', async () => {
    mocks.apiClient.mockResolvedValueOnce({});

    render(
      <NiatPerubahanGate studentName="Alya">
        <main>Dashboard mahasiswa</main>
      </NiatPerubahanGate>
    );

    expect(await screen.findByRole('dialog', { name: 'Niat Perubahan' })).toBeInTheDocument();
    expect(
      screen.queryByRole('dialog', { name: 'Dashboard tour' })
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('gami-recommendation')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Selesaikan niat' }));
    expect(
      await screen.findByRole('dialog', { name: 'Dashboard tour' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('dialog', { name: 'Niat Perubahan' })
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('gami-recommendation')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Selesaikan tour' }));
    expect(await screen.findByTestId('gami-recommendation')).toHaveTextContent(
      'Gami untuk Alya'
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
