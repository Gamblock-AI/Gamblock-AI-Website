import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders children and fires onClick', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Simpan</Button>);
    fireEvent.click(screen.getByText('Simpan'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Kirim
      </Button>
    );
    fireEvent.click(screen.getByText('Kirim'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies variant classes', () => {
    render(<Button variant="accent">Hapus</Button>);
    const btn = screen.getByText('Hapus');
    expect(btn.className).toContain('bg-crimson');
  });
});
