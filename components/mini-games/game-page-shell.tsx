'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, CircleGauge, Lightbulb } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { DashboardPage } from '@/components/dashboard/dashboard-page';
import { useBackNavigation } from '@/hooks/use-back-navigation';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes';

export type GameAccent = 'navy' | 'sky' | 'sage' | 'amber';

const accentClasses: Record<
  GameAccent,
  { icon: string; wash: string; border: string; glow: string }
> = {
  navy: {
    icon: 'bg-gradient-to-br from-navy to-indigo-700 text-white shadow-navy/20',
    wash: 'from-navy/[0.08] via-card to-card',
    border: 'border-navy/20',
    glow: 'bg-navy/15',
  },
  sky: {
    icon: 'bg-gradient-to-br from-sky to-cyan-500 text-navy shadow-sky/25',
    wash: 'from-sky/[0.14] via-card to-card',
    border: 'border-sky/35',
    glow: 'bg-sky/20',
  },
  sage: {
    icon: 'bg-gradient-to-br from-sage-light to-emerald-600 text-white shadow-sage/25',
    wash: 'from-sage/[0.12] via-card to-card',
    border: 'border-sage/30',
    glow: 'bg-sage/20',
  },
  amber: {
    icon: 'bg-gradient-to-br from-amber-300 to-amber-500 text-navy shadow-amber/25',
    wash: 'from-amber/[0.14] via-card to-card',
    border: 'border-amber/35',
    glow: 'bg-amber/20',
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
  const { goBack } = useBackNavigation();
  const tone = accentClasses[accent];
  const hasAside = Boolean(instructions || status || actions);

  return (
    <DashboardPage className="max-w-[1240px]">
      <button
        type="button"
        onClick={() => goBack(ROUTES.MINI_GAMES)}
        className="text-muted-foreground hover:text-navy focus-visible:ring-navy/35 inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t('shell.backToHub')}
      </button>

      <header
        className={cn(
          'relative overflow-hidden rounded-2xl border bg-gradient-to-r p-4 shadow-2xs sm:p-5',
          tone.border,
          tone.wash
        )}
      >
        <div
          className={cn(
            'pointer-events-none absolute -top-12 -right-10 size-40 rounded-full blur-2xl opacity-50',
            tone.glow
          )}
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-3.5 sm:gap-4">
          <span
            className={cn(
              'flex size-11 shrink-0 items-center justify-center rounded-xl shadow-xs sm:size-12',
              tone.icon
            )}
          >
            <Icon className="size-5 sm:size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            {eyebrow ? (
              <p className="text-navy-light text-[0.6875rem] font-black tracking-wider uppercase">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="text-navy text-lg leading-snug font-black tracking-tight sm:text-xl">
              {title}
            </h1>
            <p className="text-muted-foreground mt-0.5 max-w-3xl text-xs leading-relaxed sm:text-sm">
              {description}
            </p>
          </div>
        </div>
      </header>

      <div
        className={cn(
          'grid items-start gap-4 sm:gap-5',
          hasAside && 'xl:grid-cols-[minmax(0,1fr)_18rem]'
        )}
      >
        <section
          aria-label={playAreaLabel ?? title}
          className="border-border/80 bg-card min-w-0 rounded-2xl border p-4 shadow-2xs sm:rounded-3xl sm:p-6"
        >
          {children}
        </section>

        {hasAside ? (
          <aside className="grid gap-3.5 sm:grid-cols-2 xl:sticky xl:top-6 xl:grid-cols-1">
            {instructions ? (
              <section className="border-sky/25 bg-sky-light/15 rounded-2xl border p-4 shadow-2xs">
                <div className="text-navy flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <Lightbulb className="size-3.5 text-sky-dark shrink-0" aria-hidden="true" />
                  <h2>{t('shell.instructions')}</h2>
                </div>
                <div className="text-muted-foreground mt-2.5 text-xs leading-relaxed sm:text-sm">
                  {instructions}
                </div>
              </section>
            ) : null}

            {status ? (
              <section className="border-border/80 bg-card rounded-2xl border p-4 shadow-2xs">
                <div className="text-navy flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <CircleGauge className="size-3.5 text-navy-light shrink-0" aria-hidden="true" />
                  <h2>{t('shell.status')}</h2>
                </div>
                <div className="mt-2.5">{status}</div>
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
