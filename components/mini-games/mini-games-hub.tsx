import type { LucideIcon } from 'lucide-react';
import {
  ArrowUpRight,
  BrainCircuit,
  Gamepad2,
  Grid3X3,
  MountainSnow,
  Palette,
  ShieldCheck,
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
    href: `${ROUTES.MINI_GAMES}/color-sprint`,
    icon: Palette,
    index: '01',
    tone: 'sky',
  },
  {
    key: 'pictureForge',
    href: `${ROUTES.MINI_GAMES}/picture-forge`,
    icon: Grid3X3,
    index: '02',
    tone: 'sage',
  },
  {
    key: 'twinTrace',
    href: `${ROUTES.MINI_GAMES}/twin-trace`,
    icon: BrainCircuit,
    index: '03',
    tone: 'amber',
  },
  {
    key: 'brainSummit',
    href: `${ROUTES.MINI_GAMES}/brain-summit`,
    icon: MountainSnow,
    index: '04',
    tone: 'navy',
  },
];

const toneClasses: Record<
  GameCardDefinition['tone'],
  { icon: string; card: string; line: string }
> = {
  sky: {
    icon: 'bg-sky text-navy',
    card: 'hover:border-sky/55',
    line: 'bg-sky',
  },
  sage: {
    icon: 'bg-sage text-white',
    card: 'hover:border-sage/55',
    line: 'bg-sage',
  },
  amber: {
    icon: 'bg-amber text-navy',
    card: 'hover:border-amber/60',
    line: 'bg-amber',
  },
  navy: {
    icon: 'bg-navy text-white',
    card: 'hover:border-navy/50',
    line: 'bg-navy',
  },
};

export async function MiniGamesHub() {
  const t = await getTranslations('miniGames');

  return (
    <DashboardPage className="max-w-[1240px]">
      <section className="bg-navy relative isolate overflow-hidden rounded-[2rem] px-5 py-8 text-white shadow-card sm:px-8 sm:py-10 lg:px-10">
        <div
          className="border-sky/25 pointer-events-none absolute -top-24 -right-20 size-72 rounded-full border-[42px]"
          aria-hidden="true"
        />
        <div
          className="bg-sage/20 pointer-events-none absolute right-32 -bottom-28 size-52 rotate-12 rounded-[3rem]"
          aria-hidden="true"
        />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div>
            <p className="text-sky flex items-center gap-2 text-xs font-bold tracking-[0.14em] uppercase">
              <Gamepad2 className="size-4" aria-hidden="true" />
              {t('hub.eyebrow')}
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl leading-tight font-extrabold tracking-[-0.04em] sm:text-4xl">
              {t('hub.title')}
            </h1>
            <p className="text-sky-light mt-4 max-w-2xl text-sm leading-6 sm:text-base">
              {t('hub.description')}
            </p>
          </div>

          <div className="border-white/15 bg-white/[0.08] rounded-2xl border p-4 backdrop-blur-sm">
            <div className="text-sky flex items-center gap-2 text-sm font-bold">
              <ShieldCheck className="size-4" aria-hidden="true" />
              {t('hub.localBadge')}
            </div>
            <p className="text-sky-light mt-2 text-xs leading-5">
              {t('hub.localNote')}
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="mini-games-list-title">
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2
              id="mini-games-list-title"
              className="text-navy text-xl font-extrabold tracking-[-0.02em] sm:text-2xl"
            >
              {t('hub.sectionTitle')}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              {t('hub.sectionDescription')}
            </p>
          </div>
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.08em] uppercase">
            {t('hub.gameCount', { count: games.length })}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {games.map((game) => {
            const tone = toneClasses[game.tone];
            const Icon = game.icon;
            return (
              <Link
                key={game.key}
                href={game.href}
                className={cn(
                  'group border-border bg-card focus-visible:ring-navy/35 relative min-h-64 overflow-hidden rounded-3xl border p-5 shadow-soft outline-none transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:shadow-card focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none sm:p-6',
                  tone.card
                )}
                aria-label={t(`games.${game.key}.cta`)}
              >
                <span
                  className={cn(
                    'absolute inset-x-0 top-0 h-1.5',
                    tone.line
                  )}
                  aria-hidden="true"
                />
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={cn(
                      'flex size-12 items-center justify-center rounded-2xl shadow-sm',
                      tone.icon
                    )}
                  >
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="text-border text-4xl leading-none font-black tracking-[-0.08em]">
                    {game.index}
                  </span>
                </div>

                <div className="mt-7">
                  <p className="text-navy-light text-xs font-bold tracking-[0.1em] uppercase">
                    {t(`games.${game.key}.category`)}
                  </p>
                  <h3 className="text-navy mt-2 text-xl font-extrabold tracking-[-0.02em]">
                    {t(`games.${game.key}.title`)}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    {t(`games.${game.key}.description`)}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <span className="bg-muted text-muted-foreground rounded-full px-3 py-1.5 text-xs font-semibold">
                    {t(`games.${game.key}.duration`)}
                  </span>
                  <span className="text-navy inline-flex items-center gap-2 text-sm font-bold">
                    {t('hub.play')}
                    <ArrowUpRight
                      className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </DashboardPage>
  );
}
