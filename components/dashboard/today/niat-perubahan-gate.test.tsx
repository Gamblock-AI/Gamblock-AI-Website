import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NiatPerubahanGate } from './niat-perubahan-gate';

interface ModalProps {
  needsIntention: boolean;
  needsCheckIn: boolean;
  onCompleted: () => void;
}

const mocks = vi.hoisted(() => ({
  apiClient: vi.fn(),
  recoveryJourney: { todayCheckIn: true },
  modalProps: {} as Partial<ModalProps>,
}));

vi.mock('@/lib/api-client', () => ({
  apiClient: (...args: unknown[]) => mocks.apiClient(...args),
}));

vi.mock('@/hooks/use-local-user', () => ({
  useLocalUser: () => ({ role: 'user' }),
}));

vi.mock('@/hooks/use-recovery-journey', () => ({
  useRecoveryJourney: () => mocks.recoveryJourney,
}));

vi.mock('./niat-perubahan-modal', () => ({
  NiatPerubahanModal: (props: ModalProps) => {
    mocks.modalProps = props;
    return (
      <div role="dialog" aria-label="Niat Perubahan">
        <button type="button" onClick={props.onCompleted}>
          Selesaikan niat
        </button>
      </div>
    );
  },
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

beforeEach(() => {
  mocks.recoveryJourney = { todayCheckIn: true };
  mocks.modalProps = {};
});

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

  it('offers the check-in step when a new account has no check-in today', async () => {
    mocks.apiClient.mockResolvedValueOnce({});
    mocks.recoveryJourney = { todayCheckIn: null };

    render(
      <NiatPerubahanGate studentName="Alya">
        <main>Dashboard mahasiswa</main>
      </NiatPerubahanGate>
    );

    expect(
      await screen.findByRole('dialog', { name: 'Niat Perubahan' })
    ).toBeInTheDocument();
    expect(mocks.modalProps.needsIntention).toBe(true);
    expect(mocks.modalProps.needsCheckIn).toBe(true);
  });
});
