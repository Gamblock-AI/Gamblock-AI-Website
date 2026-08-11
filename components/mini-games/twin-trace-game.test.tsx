/* eslint-disable @next/next/no-img-element */

import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ImgHTMLAttributes } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import messages from '@/messages/en/engagement.json';
import { TwinTraceGame } from './twin-trace-game';

vi.mock('next/image', () => ({
  default: ({ alt = '', ...props }: ImgHTMLAttributes<HTMLImageElement>) => (
    <img alt={alt} {...props} />
  ),
}));

function renderTwinTrace() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <TwinTraceGame />
    </NextIntlClientProvider>
  );
}

describe('TwinTraceGame', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows all 5x5 fruit cards during the three-second preview', () => {
    vi.useFakeTimers();
    renderTwinTrace();

    fireEvent.click(screen.getByRole('button', { name: /5 × 5/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Shuffle and start' }));

    const board = screen.getByLabelText('5 by 5 fruit card board');
    expect(within(board).getAllByRole('button')).toHaveLength(24);
    expect(board.querySelectorAll('img')).toHaveLength(24);
    expect(within(board).getAllByRole('button')[0]).toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(2_999);
    });
    expect(within(board).getAllByRole('button')[0]).toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(within(board).getAllByRole('button')[0]).not.toBeDisabled();
    expect(board.querySelectorAll('img')).toHaveLength(0);
  });
});
