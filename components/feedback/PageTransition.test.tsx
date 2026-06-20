import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageTransition } from './PageTransition';

describe('PageTransition', () => {
  it('renders children', () => {
    render(
      <PageTransition>
        <div>konten</div>
      </PageTransition>
    );
    expect(screen.getByText('konten')).toBeInTheDocument();
  });
});
