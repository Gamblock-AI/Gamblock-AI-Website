import type { ReactNode } from 'react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

type CompactTabValue = string | number;

export type CompactTabNavItem<TValue extends CompactTabValue> = {
  value: TValue;
  label: ReactNode;
  href?: string;
  icon?: ReactNode;
  activeAdornment?: ReactNode;
  disabled?: boolean;
};

type CompactTabNavProps<TValue extends CompactTabValue> = {
  ariaLabel: string;
  value: TValue;
  items: readonly CompactTabNavItem<TValue>[];
  onValueChange?: (value: TValue) => void;
  className?: string;
};

/**
 * Compact, flat segmented navigation for in-place selectors and linked page
 * channels. It deliberately uses buttons/links rather than the generated
 * Tabs primitive because these controls switch a range or a route, not panels.
 */
export function CompactTabNav<TValue extends CompactTabValue>({
  ariaLabel,
  value,
  items,
  onValueChange,
  className,
}: CompactTabNavProps<TValue>) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        'border-border/80 bg-muted/35 inline-flex min-h-10 w-fit items-center gap-0.5 rounded-2xl border p-1',
        className
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        const itemClassName = cn(
          'focus-visible:ring-navy/35 inline-flex h-8 min-w-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold whitespace-nowrap outline-none transition-colors focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none sm:text-sm',
          active
            ? 'bg-navy text-white'
            : 'text-muted-foreground hover:bg-card/70 hover:text-navy'
        );
        const content = (
          <>
            {item.icon ? (
              <span className="flex size-4 shrink-0 items-center justify-center [&_svg]:size-3.5">
                {item.icon}
              </span>
            ) : null}
            <span className="truncate">{item.label}</span>
            {active && item.activeAdornment ? item.activeAdornment : null}
          </>
        );

        return item.href ? (
          <Link
            key={String(item.value)}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={itemClassName}
          >
            {content}
          </Link>
        ) : (
          <button
            key={String(item.value)}
            type="button"
            disabled={item.disabled}
            aria-pressed={active}
            className={itemClassName}
            onClick={() => onValueChange?.(item.value)}
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
}
