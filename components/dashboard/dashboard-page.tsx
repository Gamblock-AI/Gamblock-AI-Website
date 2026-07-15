import type { HTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Accent = 'navy' | 'sage' | 'amber' | 'crimson';

const accentClasses: Record<Accent, string> = {
  navy: 'bg-azure text-navy',
  sage: 'bg-sage/10 text-sage',
  amber: 'bg-amber/10 text-amber',
  crimson: 'bg-crimson/10 text-crimson',
};

export function DashboardPage({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mx-auto w-full max-w-6xl space-y-7 pb-8', className)}
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
    <header className="grid gap-5 border-b border-border pb-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-sage uppercase">
          <Icon className="size-4" aria-hidden="true" />
          <p>{eyebrow}</p>
        </div>
        <h1 className="mt-2 max-w-3xl text-3xl leading-tight font-extrabold tracking-tight text-navy sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
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
  children,
  className,
  ...props
}: HTMLAttributes<HTMLElement> & {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  accent?: Accent;
}) {
  return (
    <section
      className={cn(
        'rounded-[1.5rem] border border-border bg-card p-5 shadow-soft sm:p-6',
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {Icon ? (
            <span
              className={cn(
                'flex size-11 shrink-0 items-center justify-center rounded-xl',
                accentClasses[accent],
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
            </span>
          ) : null}
          <div className="min-w-0">
            <h2 className="text-lg leading-7 font-bold text-navy">{title}</h2>
            {description ? (
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
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
  const toneClasses: Record<Accent, string> = {
    navy: 'border-navy/15 bg-navy/[0.035]',
    sage: 'border-sage/20 bg-sage/[0.055]',
    amber: 'border-amber/25 bg-amber/[0.06]',
    crimson: 'border-crimson/20 bg-crimson/[0.045]',
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-start sm:justify-between',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-3 min-w-0">
        <Icon
          className={cn('mt-0.5 size-5 shrink-0', {
            'text-navy': tone === 'navy',
            'text-sage': tone === 'sage',
            'text-amber': tone === 'amber',
            'text-crimson': tone === 'crimson',
          })}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="text-sm font-bold text-navy">{title}</p>
          <div className="mt-1 text-xs leading-5 text-muted-foreground">
            {children}
          </div>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
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
    navy: 'border-navy/15 bg-navy/[0.05] text-navy',
    sage: 'border-sage/20 bg-sage/[0.08] text-sage',
    amber: 'border-amber/25 bg-amber/[0.08] text-amber',
    crimson: 'border-crimson/20 bg-crimson/[0.06] text-crimson',
    muted: 'border-border bg-muted text-muted-foreground',
  };

  return (
    <span
      className={cn(
        'inline-flex min-h-8 items-center rounded-full border px-3 text-xs font-semibold',
        classes[tone],
      )}
    >
      {children}
    </span>
  );
}
