import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/i18n/routing', () => ({ usePathname: () => '/id' }));

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
