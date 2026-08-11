'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { RefreshCw, ScanSearch } from 'lucide-react';

import { GamePageShell } from '@/components/mini-games/game-page-shell';
import { Button } from '@/components/ui/button';
import {
  TWIN_TRACE_DIFFICULTIES,
  beginTwinTracePlay,
  createTwinTraceGame,
  getTwinTraceCardAtSlot,
  isTwinTraceCardFaceUp,
  isTwinTraceInputLocked,
  resolveTwinTraceMismatch,
  selectTwinTraceCard,
  type TwinTraceDifficultyId,
  type TwinTraceGameState,
  type TwinTracePairId,
} from '@/lib/mini-games/twin-trace';
import { cn } from '@/lib/utils';

const MISMATCH_DELAY_MS = 700;
const PREVIEW_DURATION_MS = 3_000;

const pairImages: Record<TwinTracePairId, string> = {
  apple: '/images/mini-games/twin-trace/apple.webp',
  banana: '/images/mini-games/twin-trace/banana.webp',
  orange: '/images/mini-games/twin-trace/orange.webp',
  kiwi: '/images/mini-games/twin-trace/kiwi.webp',
  blueberry: '/images/mini-games/twin-trace/blueberry.webp',
  grapes: '/images/mini-games/twin-trace/grapes.webp',
  dragonfruit: '/images/mini-games/twin-trace/dragonfruit.webp',
  pineapple: '/images/mini-games/twin-trace/pineapple.webp',
  coconut: '/images/mini-games/twin-trace/coconut.webp',
  peach: '/images/mini-games/twin-trace/peach.webp',
  pear: '/images/mini-games/twin-trace/pear.webp',
  watermelon: '/images/mini-games/twin-trace/watermelon.webp',
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
  const [difficulty, setDifficulty] =
    useState<TwinTraceDifficultyId>(TWIN_TRACE_DIFFICULTIES[0].id);
  const [game, setGame] = useState<TwinTraceGameState | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);

  const firstSelectedCardId = game?.selectedCardIds[0];
  const secondSelectedCardId = game?.selectedCardIds[1];
  const timerRunning = Boolean(
    game && timerStarted && !game.previewing && game.status === 'playing'
  );

  useEffect(() => {
    if (!timerRunning) return;

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timerRunning]);

  useEffect(() => {
    if (!game?.previewing) return;

    const timeoutId = window.setTimeout(() => {
      setGame((current) => (current ? beginTwinTracePlay(current) : current));
      setAnnouncement(t('twinTrace.previewComplete'));
    }, PREVIEW_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [game?.previewing, t]);

  useEffect(() => {
    if (!firstSelectedCardId || !secondSelectedCardId) return;

    const expectedCardIds = [firstSelectedCardId, secondSelectedCardId] as const;
    const timeoutId = window.setTimeout(() => {
      setGame((current) =>
        current ? resolveTwinTraceMismatch(current, expectedCardIds) : current
      );
    }, MISMATCH_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [firstSelectedCardId, secondSelectedCardId]);

  const startGame = () => {
    setGame(createTwinTraceGame(difficulty));
    setElapsedSeconds(0);
    setTimerStarted(false);
    setAnnouncement(
      t('twinTrace.previewStatus', { seconds: PREVIEW_DURATION_MS / 1_000 })
    );
  };

  const changeDifficulty = () => {
    setGame(null);
    setElapsedSeconds(0);
    setTimerStarted(false);
    setAnnouncement('');
  };

  const selectCard = (cardId: string) => {
    if (!game || game.previewing) return;

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
              fruit: t(`twinTrace.fruitLabels.${card.pairId}`),
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

    const columnCount = game.gridSize;
    const directionByKey: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -columnCount,
      ArrowDown: columnCount,
    };
    const direction = directionByKey[event.key];
    let targetIndex: number | null = null;

    if (event.key === 'Home') targetIndex = 0;
    if (event.key === 'End') targetIndex = game.gridSize * game.gridSize - 1;
    if (direction) {
      targetIndex =
        (currentIndex + direction + game.gridSize * game.gridSize) %
        (game.gridSize * game.gridSize);
    }
    if (targetIndex === null) return;

    event.preventDefault();
    for (let offset = 0; offset < game.gridSize * game.gridSize; offset += 1) {
      const candidateIndex =
        (targetIndex +
          offset * (direction && direction < 0 ? -1 : 1) +
          game.gridSize * game.gridSize) %
        (game.gridSize * game.gridSize);
      const candidate = gridRef.current?.querySelector<HTMLButtonElement>(
        `[data-slot-index="${candidateIndex}"]`
      );
      if (candidate && !candidate.disabled) {
        candidate.focus();
        return;
      }
    }
  };

  const status = game ? (
    <dl className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
      <div className="border-border/70 bg-muted/15 flex items-center justify-between rounded-xl border px-3 py-2 shadow-2xs">
        <dt className="text-muted-foreground text-xs font-semibold">
          {t('twinTrace.stats.moves')}
        </dt>
        <dd className="text-navy font-mono text-sm font-black">
          {game.moves}
        </dd>
      </div>
      <div className="border-border/70 bg-muted/15 flex items-center justify-between rounded-xl border px-3 py-2 shadow-2xs">
        <dt className="text-muted-foreground text-xs font-semibold">
          {t('twinTrace.stats.time')}
        </dt>
        <dd className="text-navy font-mono text-sm font-black">
          {formatElapsedTime(elapsedSeconds)}
        </dd>
      </div>
      <div className="border-border/70 bg-muted/15 flex items-center justify-between rounded-xl border px-3 py-2 shadow-2xs">
        <dt className="text-muted-foreground text-xs font-semibold">
          {t('twinTrace.stats.pairs')}
        </dt>
        <dd className="text-navy font-mono text-sm font-black">
          {game.matchedPairIds.length}/{game.pairIds.length}
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
        <ul className="grid gap-2 text-xs font-medium">
          <li className="flex items-start gap-2">
            <span className="bg-amber/20 text-navy mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-black">
              1
            </span>
            <span>{t('twinTrace.instructions.reveal')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-amber/20 text-navy mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-black">
              2
            </span>
            <span>{t('twinTrace.instructions.match')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-amber/20 text-navy mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-black">
              3
            </span>
            <span>{t('twinTrace.instructions.finish')}</span>
          </li>
        </ul>
      }
      status={status}
      actions={
        game ? (
          <div className="grid w-full gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full rounded-xl font-bold"
              onClick={startGame}
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              {t('twinTrace.reset')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full rounded-xl font-bold text-xs"
              onClick={changeDifficulty}
            >
              {t('twinTrace.changeDifficulty')}
            </Button>
          </div>
        ) : undefined
      }
    >
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>

      {!game ? (
        <div className="relative isolate -m-5 sm:-m-7 flex min-h-[480px] flex-col items-center justify-center overflow-hidden rounded-[2rem] p-6 text-center sm:p-12">
          {/* Background Decorative Ambient Orbs */}
          <div
            className="pointer-events-none absolute -top-20 -left-20 size-72 rounded-full bg-amber-300/25 blur-3xl opacity-75"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-orange-400/20 blur-3xl opacity-70"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-rose-400/15 blur-3xl opacity-60"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-20 -right-20 size-72 rounded-full bg-sage/20 blur-3xl opacity-75"
            aria-hidden="true"
          />

          {/* Subtle Concentric Background Circles */}
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber/15 opacity-55"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 size-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-amber/20 opacity-40"
            aria-hidden="true"
          />

          {/* Centered Content */}
          <div className="relative z-10 mx-auto flex max-w-lg flex-col items-center">
            {/* Icon Badge with Glow & Ring */}
            <div className="relative mb-6">
              <div
                className="bg-amber/40 absolute -inset-3 rounded-[2.25rem] blur-xl opacity-80"
                aria-hidden="true"
              />
              <div className="relative flex size-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-navy shadow-[0_12px_32px_-6px_rgba(245,158,11,0.45)] ring-4 ring-amber-400/30 ring-offset-4 ring-offset-card sm:size-24">
                <ScanSearch className="size-10 sm:size-12" aria-hidden="true" />
              </div>
            </div>

            {/* Heading */}
            <h2 className="max-w-md text-2xl font-black leading-tight tracking-tight text-navy sm:text-3xl lg:text-[2rem]">
              {t('twinTrace.readyTitle')}
            </h2>

            {/* Description */}
            <p className="mt-3.5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t('twinTrace.readyDescription')}
            </p>

            {/* Difficulty Picker */}
            <fieldset className="mt-7 w-full max-w-md text-left">
              <legend className="text-navy text-xs font-black uppercase tracking-wider">
                {t('twinTrace.difficultyLabel')}
              </legend>
              <div className="mt-2.5 grid grid-cols-2 gap-3">
                {TWIN_TRACE_DIFFICULTIES.map((candidate) => {
                  const selected = candidate.id === difficulty;
                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setDifficulty(candidate.id)}
                      className={cn(
                        'rounded-2xl border-2 px-4 py-3 text-center shadow-2xs outline-none transition-all duration-150 hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-amber/35',
                        selected
                          ? 'border-amber bg-amber/15 ring-amber/40 ring-3 shadow-md'
                          : 'border-border/80 bg-card hover:border-amber/50'
                      )}
                    >
                      <span className="text-navy block text-base font-black">
                        {t(`twinTrace.difficultyNames.${candidate.id}`)}
                      </span>
                      <span className="text-muted-foreground mt-1 block text-xs font-semibold">
                        {t('twinTrace.pairCountValue', {
                          pairs: candidate.pairCount,
                          cards:
                            candidate.gridSize * candidate.gridSize -
                            (candidate.emptySlotIndex === null ? 0 : 1),
                        })}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Play Button */}
            <button
              type="button"
              onClick={startGame}
              className="group relative mt-8 inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-navy via-navy to-navy-light px-9 py-4 text-base font-extrabold text-white shadow-[0_12px_28px_-6px_rgba(22,41,76,0.35)] outline-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-6px_rgba(22,41,76,0.45)] focus-visible:ring-4 focus-visible:ring-navy/35 active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none"
            >
              <span>{t('twinTrace.start')}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-2xl">
          {game.status === 'completed' ? (
            <div
              className="border-sage/40 bg-sage/15 mb-6 rounded-2xl border p-5 text-center shadow-2xs sm:p-6"
              role="status"
            >
              <h2 className="text-sage-dark text-xl font-black">
                {t('twinTrace.completedTitle')}
              </h2>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                {t('twinTrace.completedDescription', {
                  moves: game.moves,
                  time: formatElapsedTime(elapsedSeconds),
                })}
              </p>
              <button
                type="button"
                className="shadow-card mt-4 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy via-navy to-navy-light px-6 py-2.5 text-sm font-extrabold text-white transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                onClick={startGame}
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                <span>{t('twinTrace.playAgain')}</span>
              </button>
            </div>
          ) : null}

          <div
            ref={gridRef}
            className="border-amber/20 bg-muted/15 relative mx-auto grid max-w-md gap-2 rounded-2xl border p-2.5 shadow-card sm:max-w-[28rem] sm:gap-2.5 sm:p-3 sm:rounded-3xl"
            style={{
              gridTemplateColumns: `repeat(${game.gridSize}, minmax(0, 1fr))`,
            }}
            aria-label={t('twinTrace.gridLabel', {
              gridSize: game.gridSize,
            })}
            aria-busy={game.previewing || game.selectedCardIds.length === 2}
          >
            {Array.from(
              { length: game.gridSize * game.gridSize },
              (_, slotIndex) => {
                const card = getTwinTraceCardAtSlot(game, slotIndex);

                if (!card) {
                  return (
                    <div
                      key={`empty-${slotIndex}`}
                      className="border-border/40 bg-muted/10 aspect-square rounded-xl border border-dashed sm:rounded-2xl"
                      aria-hidden="true"
                    />
                  );
                }

                const faceUp = isTwinTraceCardFaceUp(game, card);
                const matched = game.matchedPairIds.includes(card.pairId);
                const fruitLabel = t(
                  `twinTrace.fruitLabels.${card.pairId}`
                );
                const cardLabel = matched
                  ? t('twinTrace.matchedCard', {
                      position: slotIndex + 1,
                      fruit: fruitLabel,
                    })
                  : faceUp
                    ? t('twinTrace.revealedCard', {
                        position: slotIndex + 1,
                        fruit: fruitLabel,
                      })
                    : t('twinTrace.hiddenCard', { position: slotIndex + 1 });

                return (
                  <button
                    key={card.id}
                    type="button"
                    data-slot-index={slotIndex}
                    className={cn(
                      'relative aspect-square cursor-pointer overflow-hidden rounded-xl border outline-none transition-all duration-150 focus-visible:ring-4 sm:rounded-2xl',
                      matched
                        ? 'border-emerald-500/50 bg-emerald-500/10 shadow-sm opacity-90'
                        : faceUp
                          ? 'border-sky/50 bg-card shadow-md scale-[1.02]'
                          : 'border-navy/30 bg-gradient-to-br from-navy via-navy to-indigo-950 shadow-md hover:-translate-y-0.5 hover:shadow-lg hover:border-sky/40 active:scale-95'
                    )}
                    aria-label={cardLabel}
                    aria-pressed={faceUp}
                    disabled={matched || isTwinTraceInputLocked(game)}
                    onClick={() => selectCard(card.id)}
                    onKeyDown={(event) => moveGridFocus(event, slotIndex)}
                  >
                    {faceUp ? (
                      <Image
                        src={pairImages[card.pairId]}
                        width={160}
                        height={160}
                        sizes="(max-width: 640px) 25vw, 120px"
                        alt=""
                        aria-hidden="true"
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center p-1 sm:p-1.5">
                        <span
                          className="bg-white/10 text-sky shadow-2xs flex size-8 items-center justify-center rounded-lg font-mono text-lg font-black backdrop-blur-xs sm:size-9 sm:text-xl"
                          aria-hidden="true"
                        >
                          ?
                        </span>
                      </span>
                    )}
                  </button>
                );
              }
            )}
          </div>
        </div>
      )}
    </GamePageShell>
  );
}
