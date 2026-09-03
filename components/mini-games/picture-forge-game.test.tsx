/* eslint-disable @next/next/no-img-element */

import { fireEvent, render, screen, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ImgHTMLAttributes } from 'react';
import { describe, expect, it, vi } from 'vitest';

import messages from '@/messages/en/engagement.json';
import { PictureForgeGame } from './picture-forge-game';

vi.mock('@/i18n/routing', () => ({
  Link: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => '/en',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/en',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

vi.mock('next/image', () => ({
  default: ({ alt = '', ...props }: ImgHTMLAttributes<HTMLImageElement>) => (
    <img alt={alt} {...props} />
  ),
}));

function renderPictureForge() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <PictureForgeGame />
    </NextIntlClientProvider>
  );
}

describe('PictureForgeGame', () => {
  it('lets the player choose a picture and a 5x5 challenge', () => {
    renderPictureForge();

    fireEvent.click(screen.getByRole('button', { name: /Tropical platter/i }));
    fireEvent.click(screen.getByRole('button', { name: /5 × 5/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Shuffle and start' }));

    const board = screen.getByRole('group', {
      name: '5 by 5 picture puzzle board',
    });
    expect(within(board).getAllByRole('button')).toHaveLength(25);
    expect(screen.getByText('Tropical platter')).toBeInTheDocument();
  });
});
