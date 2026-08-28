import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CompactTabNav } from './compact-tab-nav';

const items = [
  { value: 'partner', label: 'Partner' },
  { value: 'team', label: 'Team' },
  { value: 'hotline', label: 'Hotline', disabled: true },
] as const;

describe('CompactTabNav', () => {
  it('marks only the controlled value active and calls back with the clicked value', () => {
    const onValueChange = vi.fn();

    render(
      <CompactTabNav
        ariaLabel="Support channel"
        value="partner"
        items={items}
        onValueChange={onValueChange}
      />
    );

    expect(screen.getByRole('button', { name: 'Partner' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Team' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Team' }));

    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith('team');
  });

  it('does not invoke the callback for disabled items', () => {
    const onValueChange = vi.fn();

    render(
      <CompactTabNav
        ariaLabel="Support channel"
        value="partner"
        items={items}
        onValueChange={onValueChange}
      />
    );

    const disabledButton = screen.getByRole('button', { name: 'Hotline' });
    expect(disabledButton).toBeDisabled();

    fireEvent.click(disabledButton);

    expect(onValueChange).not.toHaveBeenCalled();
  });
});
