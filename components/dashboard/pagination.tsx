'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

const pageButtonClassName =
  'text-navy inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-navy/30 disabled:pointer-events-none disabled:opacity-40';

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations('skillsHub');
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav
      aria-label={t('paginationLabel')}
      className="mt-6 flex flex-wrap items-center justify-center gap-1"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={pageButtonClassName}
        aria-label={t('prev')}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? 'page' : undefined}
          aria-label={t('pageOf', { current: page, total: totalPages })}
          className={cn(
            pageButtonClassName,
            page === currentPage
              ? 'bg-navy text-white shadow-sm'
              : 'text-muted-foreground hover:bg-navy/[0.06] hover:text-navy'
          )}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={pageButtonClassName}
        aria-label={t('next')}
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
