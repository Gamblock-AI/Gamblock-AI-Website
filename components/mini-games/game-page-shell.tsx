import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, CircleGauge, Lightbulb } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { DashboardPage } from '@/components/dashboard/dashboard-page';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes';

export type GameAccent = 'navy' | 'sky' | 'sage' | 'amber';

const accentClasses: Record<
  GameAccent,
  { icon: string; wash: string; border: string }
> = {
  navy: {
    icon: 'bg-navy text-white',
    wash: 'from-navy/[0.08] via-card to-card',
    border: 'border-navy/20',
  },
  sky: {
    icon: 'bg-sky text-navy',
    wash: 'from-sky/[0.14] via-card to-card',
    border: 'border-sky/35',
  },
  sage: {
    icon: 'bg-sage text-white',
    wash: 'from-sage/[0.12] via-card to-card',
    border: 'border-sage/30',
  },
  amber: {
    icon: 'bg-amber text-navy',
    wash: 'from-amber/[0.14] via-card to-card',
    border: 'border-amber/35',
  },
};

export interface GamePageShellProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children: ReactNode;
  eyebrow?: string;
  instructions?: ReactNode;
  status?: ReactNode;
  actions?: ReactNode;
  accent?: GameAccent;
  playAreaLabel?: string;
}

export function GamePageShell({
  title,
  description,
  icon: Icon,
  children,
  eyebrow,
  instructions,
  status,
  actions,
  accent = 'navy',
  playAreaLabel,
}: GamePageShellProps) {
  const t = useTranslations('miniGames');
  const tone = accentClasses[accent];
  const hasAside = Boolean(instructions || status || actions);

  return (
    <DashboardPage className="max-w-[1240px]">
      <Link
        href={ROUTES.MINI_GAMES}
        className="text-muted-foreground hover:text-navy focus-visible:ring-navy/35 inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t('shell.backToHub')}
      </Link>

      <header
        className={cn(
          'relative overflow-hidden rounded-3xl border bg-gradient-to-br p-5 shadow-soft sm:p-7',
          tone.border,
          tone.wash
        )}
      >
        <div
          className="border-navy/10 pointer-events-none absolute -top-16 -right-10 size-48 rounded-full border-[28px] opacity-60"
          aria-hidden="true"
        />
        <div className="relative flex items-start gap-4">
          <span
            className={cn(
              'flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm sm:size-14',
              tone.icon
            )}
          >
            <Icon className="size-6 sm:size-7" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-navy-light text-xs font-bold tracking-[0.12em] uppercase">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="text-navy mt-1 text-2xl leading-tight font-extrabold tracking-[-0.03em] sm:text-3xl">
              {title}
            </h1>
            <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-6 sm:text-base">
              {description}
            </p>
          </div>
        </div>
      </header>

      <div
        className={cn(
          'grid items-start gap-5',
          hasAside && 'xl:grid-cols-[minmax(0,1fr)_19rem]'
        )}
      >
        <section
          aria-label={playAreaLabel ?? title}
          className="border-border bg-card min-w-0 rounded-3xl border p-4 shadow-soft sm:p-6"
        >
          {children}
        </section>

        {hasAside ? (
          <aside className="grid gap-4 sm:grid-cols-2 xl:sticky xl:top-6 xl:grid-cols-1">
            {instructions ? (
              <section className="border-sky/30 bg-sky-light/25 rounded-2xl border p-4 sm:p-5">
                <div className="text-navy flex items-center gap-2 text-sm font-bold">
                  <Lightbulb className="size-4" aria-hidden="true" />
                  <h2>{t('shell.instructions')}</h2>
                </div>
                <div className="text-muted-foreground mt-3 text-sm leading-6">
                  {instructions}
                </div>
              </section>
            ) : null}

            {status ? (
              <section className="border-navy/15 bg-card rounded-2xl border p-4 shadow-soft sm:p-5">
                <div className="text-navy flex items-center gap-2 text-sm font-bold">
                  <CircleGauge className="size-4" aria-hidden="true" />
                  <h2>{t('shell.status')}</h2>
                </div>
                <div className="mt-3">{status}</div>
              </section>
            ) : null}

            {actions ? (
              <div className="flex flex-wrap gap-2 sm:col-span-2 xl:col-span-1">
                {actions}
              </div>
            ) : null}
          </aside>
        ) : null}
      </div>
    </DashboardPage>
  );
}
