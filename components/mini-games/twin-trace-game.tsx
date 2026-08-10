'use client';

import type { KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  CircleHelp,
  Compass,
  Leaf,
  Lightbulb,
  Music2,
  RefreshCw,
  Rocket,
  ScanSearch,
  Star,
  Telescope,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { GamePageShell } from '@/components/mini-games/game-page-shell';
import { Button } from '@/components/ui/button';
import {
  TWIN_TRACE_PAIR_IDS,
  type TwinTraceGameState,
  type TwinTracePairId,
  createTwinTraceGame,
  isTwinTraceCardFaceUp,
  isTwinTraceInputLocked,
  resolveTwinTraceMismatch,
  selectTwinTraceCard,
} from '@/lib/mini-games/twin-trace';

const MISMATCH_DELAY_MS = 700;

const pairIcons: Record<TwinTracePairId, LucideIcon> = {
  bookOpen: BookOpen,
  compass: Compass,
  leaf: Leaf,
  lightbulb: Lightbulb,
  music: Music2,
  rocket: Rocket,
  star: Star,
  telescope: Telescope,
};

function formatElapsedTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
}

export function TwinTraceGame() {
  const t = useTranslations('miniGames');
  const [game, setGame] = useState<TwinTraceGameState | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);

  const firstSelectedCardId = game?.selectedCardIds[0];
  const secondSelectedCardId = game?.selectedCardIds[1];
  const timerRunning = Boolean(
    game && timerStarted && game.status === 'playing'
  );

  useEffect(() => {
    if (!timerRunning) return;

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timerRunning]);

  useEffect(() => {
    if (!firstSelectedCardId || !secondSelectedCardId) return;

    const expectedCardIds = [firstSelectedCardId, secondSelectedCardId] as const;
    const timeoutId = window.setTimeout(() => {
      setGame((current) =>
        current
          ? resolveTwinTraceMismatch(current, expectedCardIds)
          : current
      );
    }, MISMATCH_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [firstSelectedCardId, secondSelectedCardId]);

  const startGame = () => {
    setGame(createTwinTraceGame());
    setElapsedSeconds(0);
    setTimerStarted(false);
    setAnnouncement('');
  };

  const selectCard = (cardId: string) => {
    if (!game) return;

    const card = game.cards.find((candidate) => candidate.id === cardId);
    if (!card) return;

    const nextGame = selectTwinTraceCard(game, cardId);
    if (nextGame === game) return;

    if (!timerStarted) setTimerStarted(true);
    setGame(nextGame);

    if (game.selectedCardIds.length === 0) {
      setAnnouncement(t('twinTrace.firstSelected'));
      return;
    }

    const firstCard = game.cards.find(
      (candidate) => candidate.id === game.selectedCardIds[0]
    );
    if (firstCard?.pairId === card.pairId) {
      setAnnouncement(
        nextGame.status === 'completed'
          ? t('twinTrace.completedTitle')
          : t('twinTrace.matchFound', {
              icon: t(`twinTrace.iconLabels.${card.pairId}`),
            })
      );
    } else {
      setAnnouncement(t('twinTrace.mismatch'));
    }
  };

  const moveGridFocus = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    if (!game) return;

    const columnCount = 4;
    const directionByKey: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -columnCount,
      ArrowDown: columnCount,
    };
    const direction = directionByKey[event.key];
    let targetIndex: number | null = null;

    if (event.key === 'Home') targetIndex = 0;
    if (event.key === 'End') targetIndex = game.cards.length - 1;
    if (direction) {
      targetIndex =
        (currentIndex + direction + game.cards.length) % game.cards.length;
    }
    if (targetIndex === null) return;

    event.preventDefault();
    for (let offset = 0; offset < game.cards.length; offset += 1) {
      const candidateIndex =
        (targetIndex + offset * (direction && direction < 0 ? -1 : 1) +
          game.cards.length) %
        game.cards.length;
      const candidate = gridRef.current?.querySelector<HTMLButtonElement>(
        `[data-card-index="${candidateIndex}"]`
      );
      if (candidate && !candidate.disabled) {
        candidate.focus();
        return;
      }
    }
  };

  const status = game ? (
    <dl className="grid grid-cols-3 gap-2 text-center xl:grid-cols-1 xl:text-left">
      <div className="bg-muted/55 rounded-xl px-3 py-2 xl:flex xl:items-center xl:justify-between">
        <dt className="text-muted-foreground text-xs font-semibold">
          {t('twinTrace.stats.moves')}
        </dt>
        <dd className="text-navy mt-1 text-base font-extrabold xl:mt-0">
          {game.moves}
        </dd>
      </div>
      <div className="bg-muted/55 rounded-xl px-3 py-2 xl:flex xl:items-center xl:justify-between">
        <dt className="text-muted-foreground text-xs font-semibold">
          {t('twinTrace.stats.time')}
        </dt>
        <dd className="text-navy mt-1 font-mono text-base font-extrabold xl:mt-0">
          {formatElapsedTime(elapsedSeconds)}
        </dd>
      </div>
      <div className="bg-muted/55 rounded-xl px-3 py-2 xl:flex xl:items-center xl:justify-between">
        <dt className="text-muted-foreground text-xs font-semibold">
          {t('twinTrace.stats.pairs')}
        </dt>
        <dd className="text-navy mt-1 text-base font-extrabold xl:mt-0">
          {game.matchedPairIds.length}/{TWIN_TRACE_PAIR_IDS.length}
        </dd>
      </div>
    </dl>
  ) : undefined;

  return (
    <GamePageShell
      title={t('games.twinTrace.title')}
      description={t('games.twinTrace.description')}
      eyebrow={t('games.twinTrace.category')}
      icon={ScanSearch}
      accent="amber"
      playAreaLabel={t('twinTrace.playAreaLabel')}
      instructions={
        <ol className="list-decimal space-y-2 pl-5">
          <li>{t('twinTrace.instructions.reveal')}</li>
          <li>{t('twinTrace.instructions.match')}</li>
          <li>{t('twinTrace.instructions.finish')}</li>
        </ol>
      }
      status={status}
      actions={
        game ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={startGame}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            {t('twinTrace.reset')}
          </Button>
        ) : undefined
      }
    >
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>

      {!game ? (
        <div className="flex min-h-[28rem] flex-col items-center justify-center px-4 py-10 text-center">
          <span className="bg-amber/15 text-navy flex size-20 items-center justify-center rounded-3xl">
            <ScanSearch className="size-9" aria-hidden="true" />
          </span>
          <h2 className="text-navy mt-6 text-2xl font-extrabold tracking-[-0.03em]">
            {t('twinTrace.readyTitle')}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md text-sm leading-6">
            {t('twinTrace.readyDescription')}
          </p>
          <Button type="button" size="lg" className="mt-7" onClick={startGame}>
            {t('twinTrace.start')}
          </Button>
        </div>
      ) : (
        <div className="mx-auto max-w-2xl">
          {game.status === 'completed' ? (
            <div
              className="border-sage/35 bg-sage/10 mb-5 rounded-2xl border p-4 text-center sm:p-5"
              role="status"
            >
              <h2 className="text-sage-dark text-lg font-extrabold">
                {t('twinTrace.completedTitle')}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm leading-6">
                {t('twinTrace.completedDescription', {
                  moves: game.moves,
                  time: formatElapsedTime(elapsedSeconds),
                })}
              </p>
              <Button
                type="button"
                variant="wellness"
                size="lg"
                className="mt-4"
                onClick={startGame}
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                {t('twinTrace.playAgain')}
              </Button>
            </div>
          ) : null}

          <div
            ref={gridRef}
            className="grid grid-cols-4 gap-2 sm:gap-3"
            aria-label={t('twinTrace.gridLabel')}
            aria-busy={game.selectedCardIds.length === 2}
          >
            {game.cards.map((card, index) => {
              const Icon = pairIcons[card.pairId];
              const faceUp = isTwinTraceCardFaceUp(game, card);
              const matched = game.matchedPairIds.includes(card.pairId);
              const iconLabel = t(
                `twinTrace.iconLabels.${card.pairId}`
              );
              const cardLabel = matched
                ? t('twinTrace.matchedCard', {
                    position: index + 1,
                    icon: iconLabel,
                  })
                : faceUp
                  ? t('twinTrace.revealedCard', {
                      position: index + 1,
                      icon: iconLabel,
                    })
                  : t('twinTrace.hiddenCard', { position: index + 1 });

              return (
                <button
                  key={card.id}
                  type="button"
                  data-card-index={index}
                  className={`focus-visible:ring-navy/35 aspect-square min-h-14 rounded-2xl border outline-none transition-[background-color,border-color,box-shadow,transform] duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none sm:rounded-3xl ${
                    matched
                      ? 'border-sage/45 bg-sage/15 text-sage-dark shadow-sm'
                      : faceUp
                        ? 'border-sky/60 bg-azure text-navy shadow-card'
                        : 'border-navy bg-navy text-white shadow-soft hover:-translate-y-0.5 hover:bg-navy-light'
                  }`}
                  aria-label={cardLabel}
                  aria-pressed={faceUp}
                  disabled={matched || isTwinTraceInputLocked(game)}
                  onClick={() => selectCard(card.id)}
                  onKeyDown={(event) => moveGridFocus(event, index)}
                >
                  <span className="flex h-full items-center justify-center">
                    {faceUp ? (
                      <Icon className="size-7 sm:size-9" aria-hidden="true" />
                    ) : (
                      <CircleHelp
                        className="size-7 text-sky sm:size-9"
                        aria-hidden="true"
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </GamePageShell>
  );
}
