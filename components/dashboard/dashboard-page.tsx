import type { HTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Accent = 'navy' | 'sage' | 'amber' | 'crimson';
type DashboardDensity = 'comfortable' | 'compact';
type DashboardSurface = 'default' | 'tinted' | 'muted' | 'flat';

const accentClasses: Record<Accent, string> = {
  navy: 'bg-navy text-white shadow-sm',
  sage: 'bg-sage text-white shadow-sm',
  amber: 'bg-amber/20 text-navy',
  crimson: 'bg-crimson text-white shadow-sm',
};

export function DashboardPage({
  className,
  density = 'comfortable',
  ...props
}: HTMLAttributes<HTMLDivElement> & { density?: DashboardDensity }) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[1360px] pb-8',
        density === 'compact' ? 'space-y-5' : 'space-y-6 sm:space-y-7',
        className
      )}
      {...props}
    />
  );
}

export function DashboardPageHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  aside,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
}) {
  return (
    <header className="border-navy/15 grid gap-4 border-b pb-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
      <div>
        <div className="text-navy-light flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase">
          <span className="bg-azure/75 text-navy flex size-8 items-center justify-center rounded-lg">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <p>{eyebrow}</p>
        </div>
        <h1 className="text-navy mt-3 max-w-3xl text-[1.875rem] leading-tight font-extrabold tracking-[-0.03em] sm:text-[2.25rem]">
          {title}
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-7 sm:text-base">
          {description}
        </p>
      </div>
      {aside ? <div>{aside}</div> : null}
    </header>
  );
}

export function DashboardPanel({
  icon: Icon,
  title,
  description,
  action,
  accent = 'navy',
  density = 'comfortable',
  surface = 'default',
  children,
  className,
  contentClassName,
  ...props
}: HTMLAttributes<HTMLElement> & {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  accent?: Accent;
  density?: DashboardDensity;
  surface?: DashboardSurface;
  contentClassName?: string;
}) {
  const surfaceClasses: Record<DashboardSurface, string> = {
    default: 'border-border bg-card shadow-soft',
    tinted: 'border-navy/20 bg-card shadow-soft',
    muted: 'border-border bg-muted/45 shadow-none',
    flat: 'border-transparent bg-transparent shadow-none',
  };

  return (
    <section
      className={cn(
        'rounded-2xl border',
        surfaceClasses[surface],
        density === 'compact' ? 'p-4 sm:p-5' : 'p-5 sm:p-6',
        className
      )}
      {...props}
    >
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="flex min-w-0 items-center gap-3">
          {Icon ? (
            <span
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-xl',
                accentClasses[accent]
              )}
            >
              <Icon className="size-[1.125rem]" aria-hidden="true" />
            </span>
          ) : null}
          <h2 className="text-navy min-w-0 text-lg leading-7 font-bold">
            {title}
          </h2>
        </div>
        {action ? (
          <div className="w-full min-w-0 justify-self-start sm:w-auto sm:justify-self-end">
            {action}
          </div>
        ) : null}
      </div>
      {description ? (
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          {description}
        </p>
      ) : null}
      {children ? (
        <div
          className={cn(
            density === 'compact' ? 'mt-4' : 'mt-5',
            contentClassName
          )}
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}

export function DashboardNotice({
  icon: Icon,
  title,
  children,
  action,
  tone = 'navy',
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  icon: LucideIcon;
  title: string;
  action?: ReactNode;
  tone?: Accent;
}) {
  return (
    <div
      className={cn(
        'border-border bg-card shadow-soft rounded-2xl border p-4',
        className
      )}
      {...props}
    >
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-xl',
              accentClasses[tone]
            )}
          >
            <Icon className="size-[1.125rem]" aria-hidden="true" />
          </span>
          <p className="text-navy min-w-0 text-[0.9375rem] leading-6 font-bold">
            {title}
          </p>
        </div>
        {action ? (
          <div className="w-full min-w-0 justify-self-start sm:w-auto sm:justify-self-end">
            {action}
          </div>
        ) : null}
      </div>
      {children ? (
        <div className="text-muted-foreground mt-3 text-sm leading-6">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function DashboardStatus({
  children,
  tone = 'navy',
}: {
  children: ReactNode;
  tone?: Accent | 'muted';
}) {
  const classes = {
    navy: 'border-navy/25 bg-azure/75 text-navy',
    sage: 'border-sage/35 bg-sage/[0.12] text-sage',
    amber: 'border-amber/40 bg-amber/[0.12] text-amber',
    crimson: 'border-crimson/30 bg-crimson/[0.09] text-crimson',
    muted: 'border-border bg-muted text-muted-foreground',
  };

  return (
    <span
      className={cn(
        'inline-flex min-h-8 items-center rounded-full border px-3 text-xs font-semibold',
        classes[tone]
      )}
    >
      {children}
    </span>
  );
}
