'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InfiniteScrollSentinelProps {
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Sentinel callback ref to attach to the bottom trigger DOM node */
  sentinelRef: (node: HTMLElement | null) => void;
  /** Optional loading message */
  loadingText?: string;
  /** Additional container styling */
  className?: string;
}

export function InfiniteScrollSentinel({
  hasMore,
  sentinelRef,
  loadingText,
  className,
}: InfiniteScrollSentinelProps) {
  if (!hasMore) return null;

  return (
    <div
      ref={sentinelRef}
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center justify-center gap-2 py-3 text-muted-foreground text-xs select-none',
        className
      )}
    >
      <Loader2 className="size-3.5 animate-spin text-navy/60" aria-hidden="true" />
      {loadingText ? (
        <span className="text-[0.6875rem] font-medium">{loadingText}</span>
      ) : null}
    </div>
  );
}
