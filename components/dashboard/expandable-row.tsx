'use client';

import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Collapsible row used across partner-facing queues and lists: a compact
 * header stays visible and a single click reveals the detail body. Matches the
 * expandable member rows on the /partners group card.
 */
export function ExpandableRow({
  open,
  onToggle,
  header,
  children,
  className,
  bodyClassName,
}: {
  open: boolean;
  onToggle: () => void;
  header: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={cn(
        'border-border/80 bg-card rounded-xl border transition-all duration-200 shadow-2xs',
        open
          ? 'border-navy/25 ring-1 ring-navy/10'
          : 'hover:border-navy/20 hover:bg-muted/15',
        className
      )}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onToggle();
          }
        }}
        className="flex w-full cursor-pointer items-center justify-between gap-3 p-3 select-none"
      >
        {header}
        <span
          className={cn(
            'text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/50 transition-transform duration-200',
            open && 'rotate-180 text-navy bg-azure/80'
          )}
        >
          <ChevronDown className="size-4" aria-hidden="true" />
        </span>
      </div>
      {open ? (
        <div
          className={cn(
            'border-border/70 bg-muted/15 rounded-b-xl border-t p-3.5 sm:p-4',
            bodyClassName
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
