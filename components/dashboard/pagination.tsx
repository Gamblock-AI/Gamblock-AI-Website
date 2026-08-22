'use client';

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  /** Current active page number (1-indexed) */
  currentPage: number;
  /** Total number of pages available */
  totalPages: number;
  /** Callback when user changes page */
  onPageChange: (page: number) => void;
  /** Additional container classes */
  className?: string;
  /** Visual variant: 'floating' (pill island container) or 'flat' (inline row) */
  variant?: 'floating' | 'flat';
  /** Button sizing: 'sm' (compact, 28px) or 'md' (default, 32px) */
  size?: 'sm' | 'md';
  /** Number of sibling pages to show on either side of active page */
  siblingCount?: number;
  /** Accessible label for the navigation element */
  ariaLabel?: string;
}

const pageButtonBase =
  'inline-flex items-center justify-center font-bold transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-navy/30 select-none cursor-pointer disabled:pointer-events-none disabled:opacity-25 active:scale-95 motion-reduce:transform-none';

export function getPaginationItems(
  currentPage: number,
  totalPages: number,
  siblingCount = 1
): (number | 'ellipsis-left' | 'ellipsis-right')[] {
  const totalNumbers = siblingCount * 2 + 5;

  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  // Case 1: No left dots, show right dots (near start)
  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, 'ellipsis-right', totalPages];
  }

  // Case 2: Show left dots, no right dots (near end)
  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1
    );
    return [1, 'ellipsis-left', ...rightRange];
  }

  // Case 3: Show both left and right dots (in the middle)
  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [1, 'ellipsis-left', ...middleRange, 'ellipsis-right', totalPages];
  }

  return Array.from({ length: totalPages }, (_, index) => index + 1);
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  variant = 'floating',
  size = 'md',
  siblingCount = 1,
  ariaLabel,
}: PaginationProps) {
  const t = useTranslations('pagination');
  if (totalPages <= 1) return null;

  const items = getPaginationItems(currentPage, totalPages, siblingCount);
  const isSm = size === 'sm';

  const sizeClasses = isSm
    ? 'h-7 min-w-7 px-1.5 text-xs rounded-lg'
    : 'h-8 min-w-8 px-2 text-xs sm:text-sm rounded-xl';

  return (
    <nav
      role="navigation"
      aria-label={ariaLabel || t('paginationLabel')}
      className={cn(
        'flex items-center justify-center',
        isSm ? 'gap-0.5' : 'gap-1',
        variant === 'floating'
          ? 'border-border/80 bg-card/95 shadow-soft backdrop-blur-md rounded-2xl border p-1'
          : '',
        className
      )}
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={cn(
          pageButtonBase,
          sizeClasses,
          'text-muted-foreground hover:bg-navy/5 hover:text-navy group'
        )}
        aria-label={t('prev')}
      >
        <ChevronLeft
          className={cn(
            isSm ? 'size-3.5' : 'size-4',
            'transition-transform duration-150 group-hover:-translate-x-0.5 motion-reduce:transform-none'
          )}
          aria-hidden="true"
        />
      </button>

      {items.map((item, idx) => {
        if (typeof item === 'string') {
          return (
            <span
              key={`${item}-${idx}`}
              className={cn(
                'text-muted-foreground/45 inline-flex items-center justify-center select-none',
                isSm ? 'h-7 min-w-5' : 'h-8 min-w-6'
              )}
              aria-hidden="true"
            >
              <MoreHorizontal className={isSm ? 'size-3' : 'size-3.5'} />
            </span>
          );
        }

        const isCurrent = item === currentPage;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={isCurrent ? 'page' : undefined}
            aria-label={t('pageOf', { current: item, total: totalPages })}
            className={cn(
              pageButtonBase,
              sizeClasses,
              isCurrent
                ? 'bg-navy text-white shadow-2xs font-black ring-1 ring-navy/15 hover:bg-navy'
                : 'text-muted-foreground hover:bg-navy/5 hover:text-navy'
            )}
          >
            {item}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={cn(
          pageButtonBase,
          sizeClasses,
          'text-muted-foreground hover:bg-navy/5 hover:text-navy group'
        )}
        aria-label={t('next')}
      >
        <ChevronRight
          className={cn(
            isSm ? 'size-3.5' : 'size-4',
            'transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transform-none'
          )}
          aria-hidden="true"
        />
      </button>
    </nav>
  );
}
