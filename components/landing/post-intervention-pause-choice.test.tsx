import { act, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';
import messages from '@/messages/id/legal-support.json';
import { PostInterventionPauseChoice } from './post-intervention-pause-choice';

function renderPauseChoice() {
  return render(
    <NextIntlClientProvider locale="id" messages={messages}>
      <PostInterventionPauseChoice />
    </NextIntlClientProvider>
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe('PostInterventionPauseChoice', () => {
  it('guides a user through the structured pause flow without leaving the page', () => {
    renderPauseChoice();

    fireEvent.click(screen.getByRole('button', { name: 'Mulai jeda' }));
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Intensitas dorongan dari 0 sampai 10: 6',
      })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Lanjutkan' }));
    fireEvent.click(screen.getByRole('option', { name: 'Stres' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mulai jeda 45 detik' }));

    expect(screen.getByRole('progressbar', { name: 'Kemajuan jeda' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Tahapan jeda' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.queryByRole('button', { name: 'Sadari' })).not.toBeInTheDocument();
    expect(screen.getByText('Lanjutkan timer')).toBeInTheDocument();
  });

  it('completes the timer, records a local final rating, and exposes the selected route', () => {
    vi.useFakeTimers();
    renderPauseChoice();

    fireEvent.click(screen.getByRole('button', { name: 'Mulai jeda' }));
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Intensitas dorongan dari 0 sampai 10: 8',
      })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Lanjutkan' }));
    fireEvent.click(screen.getByRole('option', { name: 'Bosan' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mulai jeda 45 detik' }));
    fireEvent.click(screen.getByRole('button', { name: 'Lanjutkan timer' }));

    act(() => {
      vi.advanceTimersByTime(45_000);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Pilih langkah 10 menit' }));
    fireEvent.click(screen.getByRole('option', { name: 'Buka Ruang Pemulihan' }));
    fireEvent.click(screen.getByRole('button', { name: 'Nilai lagi dorongannya' }));
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Intensitas dorongan dari 0 sampai 10: 3',
      })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Selesaikan jeda' }));

    expect(screen.getByText('Kamu sudah memberi jeda')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lanjutkan pilihan ini' })).toHaveAttribute(
      'href',
      '/recovery'
    );
  });
});
