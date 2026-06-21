import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './empty-state';
import { Users } from 'lucide-react';
import { useTranslations } from "next-intl";

describe('EmptyState', () => {
  it('renders title and hint', () => {
    render(<EmptyState icon={Users} title={t('text_331')} hint="Bagikan kode grup" />);
    expect(screen.getByText('Belum ada member')).toBeInTheDocument();
    expect(screen.getByText('Bagikan kode grup')).toBeInTheDocument();
  });
});
