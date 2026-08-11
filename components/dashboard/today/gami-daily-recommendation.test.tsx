/* eslint-disable @next/next/no-img-element */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ImgHTMLAttributes } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SpkRecommendation } from '@/hooks/use-spk-recommendation';
import recoveryMessages from '@/messages/id/recovery.json';
import { GAMI_RECOMMENDATION_SEEN_KEY } from '@/lib/recovery/gami-recommendation-storage';
import { GamiDailyRecommendation } from './gami-daily-recommendation';

const mocks = vi.hoisted(() => ({
  useSpkRecommendation: vi.fn(),
}));

vi.mock('@/hooks/use-spk-recommendation', () => ({
  useSpkRecommendation: () => mocks.useSpkRecommendation(),
}));

vi.mock('next/image', () => ({
  default: ({
    alt = '',
    fill: _fill,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
  }) => {
    void _fill;
    return <img alt={alt} {...props} />;
  },
}));

const recommendation: SpkRecommendation = {
  recommendation_id: 'spk-daily-1',
  recommended_at: '2026-08-11T07:00:00Z',
  recommendation_enabled: true,
  feature: {
    intervention_key: 'RECOVERY_PRACTICE',
    response_type: 'ACTION',
    feature_id: 'recovery_practice',
    category: 'recovery',
    route: '/recovery',
    action: 'practice',
    load: 1,
  },
  support_level: 'MEDIUM',
  support_score: 1,
  engagement_level: 'LOW',
  intervention_needed: true,
  reason_code: 'spk_baseline_rule',
  reason: {
    code: 'spk_baseline_rule',
    support_level: 'MEDIUM',
    engagement_level: 'LOW',
    support_score: 1,
    factors: [
      {
        key: 'daily_missions_completed',
        score: 1,
        weight_percent: 20,
      },
    ],
  },
  time_trigger: { has_time_pattern: true },
  effectiveness_history_used: false,
  data_state: 'partial',
  data_gaps: [
    {
      key: 'learning_activities_7d',
      action: 'learn',
      route: '/skills',
    },
  ],
  available_weight_percent: 70,
  personalized_message: 'Mari ambil satu langkah kecil hari ini.',
  personalized_explanation: '',
  llm_used: true,
};

function renderGami() {
  return render(
    <NextIntlClientProvider locale="id" messages={recoveryMessages}>
      <GamiDailyRecommendation studentName="Alya" />
    </NextIntlClientProvider>
  );
}

afterEach(() => {
  window.localStorage.clear();
  mocks.useSpkRecommendation.mockReset();
});

describe('GamiDailyRecommendation', () => {
  it('greets automatically once for a new daily recommendation ID', async () => {
    mocks.useSpkRecommendation.mockReturnValue({
      recommendation,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    const first = renderGami();
    expect(await screen.findByText('Halo, Alya!')).toBeInTheDocument();
    expect(window.localStorage.getItem(GAMI_RECOMMENDATION_SEEN_KEY)).toBe(
      recommendation.recommendation_id
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Tutup percakapan Gami' })
    );
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    first.unmount();

    renderGami();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Buka rekomendasi harian dari Gami',
      })
    ).toBeInTheDocument();
  });

  it('opens the recommendation directly from the launcher and reveals details', async () => {
    window.localStorage.setItem(
      GAMI_RECOMMENDATION_SEEN_KEY,
      recommendation.recommendation_id
    );
    mocks.useSpkRecommendation.mockReturnValue({
      recommendation,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    renderGami();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Buka rekomendasi harian dari Gami',
      })
    );
    expect(
      await screen.findByText('Latihan pemulihan singkat')
    ).toBeInTheDocument();
    expect(screen.getByText('Mari ambil satu langkah kecil hari ini.')).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Mengapa rekomendasi ini?' })
    );
    expect(
      await screen.findByText('Misi harianmu belum banyak yang selesai.')
    ).toBeInTheDocument();
    expect(screen.getByText('Jelajahi materi belajar')).toBeInTheDocument();
  });

  it('does not interrupt when personalized recommendations are disabled', () => {
    mocks.useSpkRecommendation.mockReturnValue({
      recommendation: {
        ...recommendation,
        recommendation_id: '',
        recommendation_enabled: false,
      },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    renderGami();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Buka rekomendasi harian dari Gami',
      })
    );
    expect(
      screen.getByText('Rekomendasi personal dimatikan')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Atur privasi di Pengaturan' })
    ).toBeInTheDocument();
  });

  it('stays hidden when the initial recommendation request fails', () => {
    mocks.useSpkRecommendation.mockReturnValue({
      recommendation: null,
      loading: false,
      error: new Error('request failed'),
      refetch: vi.fn(),
    });
    renderGami();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: 'Buka rekomendasi harian dari Gami',
      })
    ).not.toBeInTheDocument();
  });
});
