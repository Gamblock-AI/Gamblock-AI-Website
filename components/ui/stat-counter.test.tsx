import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCounter } from './stat-counter';

// Force reduced-motion so the counter renders its final value synchronously
// (GSAP ScrollTrigger never fires in jsdom).
vi.mock('framer-motion', () => ({
  useReducedMotion: () => true,
}));

describe('StatCounter', () => {
  it('renders the final value with prefix and suffix under reduced motion', () => {
    render(<StatCounter value={286.84} prefix="Rp" suffix="T" decimals={2} locale="id-ID" />);
    expect(screen.getByText('Rp286,84T')).toBeInTheDocument();
  });

  it('formats large integers with locale grouping', () => {
    render(<StatCounter value={5500000} suffix="+" locale="id-ID" />);
    expect(screen.getByText('5.500.000+')).toBeInTheDocument();
  });
});
