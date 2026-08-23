import type { LucideIcon } from 'lucide-react';
import {
  ArrowUpRight,
  BrainCircuit,
  Clock,
  Gamepad2,
  Grid3X3,
  MountainSnow,
  Palette,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { DashboardPage } from '@/components/dashboard/dashboard-page';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes';

type GameKey =
  | 'colorSprint'
  | 'pictureForge'
  | 'twinTrace'
  | 'brainSummit';

interface GameCardDefinition {
  key: GameKey;
  href: string;
  icon: LucideIcon;
  index: string;
  tone: 'sky' | 'sage' | 'amber' | 'navy';
}

const games: readonly GameCardDefinition[] = [
  {
    key: 'colorSprint',
    href: ROUTES.MINI_GAMES_COLOR_SPRINT,
    icon: Palette,
    index: '01',
    tone: 'sky',
  },
  {
    key: 'pictureForge',
    href: ROUTES.MINI_GAMES_PICTURE_FORGE,
    icon: Grid3X3,
    index: '02',
    tone: 'sage',
  },
  {
    key: 'twinTrace',
    href: ROUTES.MINI_GAMES_TWIN_TRACE,
    icon: BrainCircuit,
    index: '03',
    tone: 'amber',
  },
  {
    key: 'brainSummit',
    href: ROUTES.MINI_GAMES_BRAIN_SUMMIT,
    icon: MountainSnow,
    index: '04',
    tone: 'navy',
  },
];

interface ToneStyle {
  gradientBar: string;
  cornerGlow: string;
  iconBg: string;
  badge: string;
  dot: string;
  hoverBorder: string;
  hoverShadow: string;
  watermark: string;
}

const toneStyles: Record<GameCardDefinition['tone'], ToneStyle> = {
  sky: {
    gradientBar: 'from-sky via-cyan-400 to-teal-400',
    cornerGlow: 'bg-sky/20',
    iconBg: 'bg-gradient-to-br from-sky to-cyan-500 text-navy shadow-sky/25',
    badge: 'bg-sky/15 text-navy border-sky/30',
    dot: 'bg-sky-500',
    hoverBorder: 'hover:border-sky/50',
    hoverShadow: 'hover:shadow-[0_20px_45px_-15px_rgba(61,214,245,0.28)]',
    watermark: 'text-sky/15 group-hover:text-sky/30',
  },
  sage: {
    gradientBar: 'from-emerald-400 via-sage to-teal-500',
    cornerGlow: 'bg-sage/20',
    iconBg: 'bg-gradient-to-br from-sage-light to-emerald-600 text-white shadow-sage/25',
    badge: 'bg-sage/15 text-sage-dark border-sage/30',
    dot: 'bg-sage',
    hoverBorder: 'hover:border-sage/50',
    hoverShadow: 'hover:shadow-[0_20px_45px_-15px_rgba(47,158,111,0.28)]',
    watermark: 'text-sage/15 group-hover:text-sage/30',
  },
  amber: {
    gradientBar: 'from-amber-400 via-amber-500 to-orange-400',
    cornerGlow: 'bg-amber/20',
    iconBg: 'bg-gradient-to-br from-amber-300 to-amber-500 text-navy shadow-amber/25',
    badge: 'bg-amber/15 text-amber-900 border-amber/30',
    dot: 'bg-amber-500',
    hoverBorder: 'hover:border-amber/50',
    hoverShadow: 'hover:shadow-[0_20px_45px_-15px_rgba(224,165,22,0.28)]',
    watermark: 'text-amber/15 group-hover:text-amber/30',
  },
  navy: {
    gradientBar: 'from-navy via-navy-light to-indigo-600',
    cornerGlow: 'bg-navy/15',
    iconBg: 'bg-gradient-to-br from-navy to-indigo-700 text-white shadow-navy/25',
    badge: 'bg-navy/10 text-navy border-navy/20',
    dot: 'bg-navy',
    hoverBorder: 'hover:border-navy/40',
    hoverShadow: 'hover:shadow-[0_20px_45px_-15px_rgba(22,41,76,0.25)]',
    watermark: 'text-navy/10 group-hover:text-navy/25',
  },
};

export async function MiniGamesHub() {
  const t = await getTranslations('miniGames');

  return (
    <DashboardPage className="max-w-[1240px]">
      <section className="bg-gradient-to-r from-navy via-navy to-indigo-950 relative isolate overflow-hidden rounded-2xl px-5 py-5 text-white shadow-card sm:px-7 sm:py-6">
        <div
          className="border-sky/20 pointer-events-none absolute -top-20 -right-16 size-56 rounded-full border-[32px]"
          aria-hidden="true"
        />
        <div
          className="bg-sage/15 pointer-events-none absolute right-24 -bottom-20 size-40 rotate-12 rounded-3xl"
          aria-hidden="true"
        />

        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-center">
          <div>
            <p className="text-sky flex items-center gap-1.5 text-[0.6875rem] font-bold tracking-[0.14em] uppercase">
              <Gamepad2 className="size-3.5" aria-hidden="true" />
              {t('hub.eyebrow')}
            </p>
            <h1 className="mt-1.5 max-w-2xl text-2xl leading-tight font-black tracking-tight sm:text-3xl">
              {t('hub.title')}
            </h1>
            <p className="text-sky-light mt-1.5 max-w-xl text-xs leading-relaxed sm:text-sm">
              {t('hub.description')}
            </p>
          </div>

          <div className="border-white/15 bg-white/[0.07] rounded-xl border p-3.5 backdrop-blur-xs shadow-2xs">
            <div className="text-sky flex items-center gap-1.5 text-xs font-bold">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              {t('hub.localBadge')}
            </div>
            <p className="text-sky-light/90 mt-1 text-[0.6875rem] leading-normal">
              {t('hub.localNote')}
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="mini-games-list-title">
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-amber" />
              <h2
                id="mini-games-list-title"
                className="text-navy text-xl font-extrabold tracking-[-0.02em] sm:text-2xl"
              >
                {t('hub.sectionTitle')}
              </h2>
            </div>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              {t('hub.sectionDescription')}
            </p>
          </div>
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.08em] uppercase">
            {t('hub.gameCount', { count: games.length })}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {games.map((game) => {
            const tone = toneStyles[game.tone];
            const Icon = game.icon;
            return (
              <Link
                key={game.key}
                href={game.href}
                className={cn(
                  'group border-border/80 bg-card focus-visible:ring-navy/35 relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-2xs outline-none transition-all duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none sm:p-5.5',
                  tone.hoverBorder,
                  tone.hoverShadow
                )}
                aria-label={t(`games.${game.key}.cta`)}
              >
                {/* Top Accent Gradient Bar */}
                <span
                  className={cn(
                    'absolute inset-x-0 top-0 h-1 bg-gradient-to-r',
                    tone.gradientBar
                  )}
                  aria-hidden="true"
                />

                {/* Ambient Corner Glow on Hover */}
                <div
                  className={cn(
                    'pointer-events-none absolute -top-10 -right-10 size-32 rounded-full blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                    tone.cornerGlow
                  )}
                  aria-hidden="true"
                />

                {/* Top Row: Icon, Category Badge & Watermark */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex size-12 shrink-0 items-center justify-center rounded-xl shadow-xs transition-transform duration-200 group-hover:scale-105',
                          tone.iconBg
                        )}
                      >
                        <Icon className="size-6" aria-hidden="true" />
                      </div>
                      <div
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.6875rem] font-extrabold uppercase tracking-wider border shadow-2xs',
                          tone.badge
                        )}
                      >
                        <span
                          className={cn('size-1.5 rounded-full animate-pulse', tone.dot)}
                        />
                        {t(`games.${game.key}.category`)}
                      </div>
                    </div>
                    <span
                      className={cn(
                        'font-display text-4xl font-black leading-none tracking-tighter transition-all duration-200 select-none group-hover:scale-105',
                        tone.watermark
                      )}
                    >
                      {game.index}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-3.5">
                    <h3 className="text-navy text-lg font-black tracking-tight transition-colors duration-200 group-hover:text-navy-light sm:text-xl">
                      {t(`games.${game.key}.title`)}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed sm:text-sm line-clamp-2">
                      {t(`games.${game.key}.description`)}
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Duration Pill & Play Button */}
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/50 pt-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-xs font-semibold text-muted-foreground border border-border/50">
                    <Clock className="size-3 text-muted-foreground/70" />
                    {t(`games.${game.key}.duration`)}
                  </span>
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-navy/5 px-3 py-1.5 text-xs font-extrabold text-navy transition-all duration-200 group-hover:bg-navy group-hover:text-white group-hover:shadow-xs">
                    <span>{t('hub.play')}</span>
                    <ArrowUpRight
                      className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </DashboardPage>
  );
}
