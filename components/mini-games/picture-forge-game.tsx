'use client';

import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  Grid3X3,
  ImageIcon,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { GamePageShell } from '@/components/mini-games/game-page-shell';
import { Button } from '@/components/ui/button';
import {
  PICTURE_FORGE_DIFFICULTIES,
  PICTURE_FORGE_PUZZLES,
  createPictureForgeBoard,
  createSolvedPictureForgeBoard,
  getPictureForgeTileCoordinates,
  isPictureForgeSolved,
  swapPictureForgeTiles,
  type PictureForgeBoard,
  type PictureForgeDifficultyId,
  type PictureForgePuzzleId,
} from '@/lib/mini-games/picture-forge';
import { cn } from '@/lib/utils';

type PuzzlePhase = 'ready' | 'playing' | 'completed';

function PuzzleStat({
  icon: Icon,
  label,
  value,
}: {
  icon?: LucideIcon;
  label: string;
  value: string | number;
}) {
  return (
    <div className="border-border/70 bg-muted/15 flex items-center justify-between gap-2.5 rounded-xl border px-3 py-2 shadow-2xs">
      <div className="flex items-center gap-2 min-w-0">
        {Icon ? (
          <span className="bg-sage/15 text-sage-dark flex size-7 shrink-0 items-center justify-center rounded-lg shadow-2xs">
            <Icon className="size-3.5" aria-hidden="true" />
          </span>
        ) : null}
        <dt className="text-muted-foreground truncate text-xs font-semibold">{label}</dt>
      </div>
      <dd className="text-navy font-mono text-sm font-black">{value}</dd>
    </div>
  );
}

export function PictureForgeGame() {
  const t = useTranslations('miniGames');
  const [phase, setPhase] = useState<PuzzlePhase>('ready');
  const [selectedPuzzleId, setSelectedPuzzleId] =
    useState<PictureForgePuzzleId>(PICTURE_FORGE_PUZZLES[0].id);
  const [selectedDifficultyId, setSelectedDifficultyId] =
    useState<PictureForgeDifficultyId>(PICTURE_FORGE_DIFFICULTIES[0].id);
  const [activePuzzleId, setActivePuzzleId] =
    useState<PictureForgePuzzleId>(PICTURE_FORGE_PUZZLES[0].id);
  const [activeDifficultyId, setActiveDifficultyId] =
    useState<PictureForgeDifficultyId>(PICTURE_FORGE_DIFFICULTIES[0].id);
  const [board, setBoard] = useState<PictureForgeBoard>(() =>
    createSolvedPictureForgeBoard(PICTURE_FORGE_DIFFICULTIES[0].gridSize)
  );
  const [initialBoard, setInitialBoard] = useState<PictureForgeBoard>(() =>
    createSolvedPictureForgeBoard(PICTURE_FORGE_DIFFICULTIES[0].gridSize)
  );
  const [selectedPosition, setSelectedPosition] = useState<number | null>(
    null
  );
  const [moves, setMoves] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [pageVisible, setPageVisible] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  const [focusedTile, setFocusedTile] = useState<number | null>(null);

  const selectedPuzzle =
    PICTURE_FORGE_PUZZLES.find((puzzle) => puzzle.id === selectedPuzzleId) ??
    PICTURE_FORGE_PUZZLES[0];
  const selectedDifficulty =
    PICTURE_FORGE_DIFFICULTIES.find(
      (difficulty) => difficulty.id === selectedDifficultyId
    ) ?? PICTURE_FORGE_DIFFICULTIES[0];
  const activePuzzle =
    PICTURE_FORGE_PUZZLES.find((puzzle) => puzzle.id === activePuzzleId) ??
    PICTURE_FORGE_PUZZLES[0];
  const activeDifficulty =
    PICTURE_FORGE_DIFFICULTIES.find(
      (difficulty) => difficulty.id === activeDifficultyId
    ) ?? PICTURE_FORGE_DIFFICULTIES[0];
  const gridSize = activeDifficulty.gridSize;

  const startChallenge = useCallback(() => {
    const nextBoard = createPictureForgeBoard(selectedDifficulty.gridSize);
    setActivePuzzleId(selectedPuzzleId);
    setActiveDifficultyId(selectedDifficultyId);
    setBoard(nextBoard);
    setInitialBoard(nextBoard);
    setSelectedPosition(null);
    setFocusedTile(0);
    setMoves(0);
    setElapsedSeconds(0);
    setAnnouncement('');
    setPhase('playing');
  }, [selectedDifficulty.gridSize, selectedDifficultyId, selectedPuzzleId]);

  const shuffleBoard = useCallback(() => {
    const nextBoard = createPictureForgeBoard(activeDifficulty.gridSize);
    setBoard(nextBoard);
    setInitialBoard(nextBoard);
    setSelectedPosition(null);
    setFocusedTile(0);
    setMoves(0);
    setElapsedSeconds(0);
    setAnnouncement('');
    setPhase('playing');
  }, [activeDifficulty.gridSize]);

  const resetBoard = useCallback(() => {
    setBoard([...initialBoard]);
    setSelectedPosition(null);
    setFocusedTile(0);
    setMoves(0);
    setElapsedSeconds(0);
    setAnnouncement('');
    setPhase('playing');
  }, [initialBoard]);

  const changeChallenge = useCallback(() => {
    setSelectedPuzzleId(activePuzzleId);
    setSelectedDifficultyId(activeDifficultyId);
    setSelectedPosition(null);
    setAnnouncement('');
    setPhase('ready');
  }, [activeDifficultyId, activePuzzleId]);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateVisibility();
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  useEffect(() => {
    if (phase !== 'playing' || !pageVisible) return;

    const interval = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1_000);

    return () => window.clearInterval(interval);
  }, [pageVisible, phase]);

  const selectTile = useCallback(
    (position: number) => {
      if (phase !== 'playing') return;

      if (selectedPosition === null) {
        setSelectedPosition(position);
        setAnnouncement(
          t('pictureForge.selectedStatus', { position: position + 1 })
        );
        return;
      }

      if (selectedPosition === position) {
        setSelectedPosition(null);
        setAnnouncement('');
        return;
      }

      const nextBoard = swapPictureForgeTiles(
        board,
        selectedPosition,
        position
      );
      setBoard(nextBoard);
      setSelectedPosition(null);
      setMoves((current) => current + 1);

      if (isPictureForgeSolved(nextBoard, gridSize)) {
        setPhase('completed');
        setAnnouncement(t('pictureForge.completeStatus'));
      } else {
        setAnnouncement(
          t('pictureForge.swapStatus', {
            first: selectedPosition + 1,
            second: position + 1,
          })
        );
      }
    }, [board, gridSize, phase, selectedPosition, t]
  );

  const handleTileKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    position: number
  ) => {
    const row = Math.floor(position / gridSize);
    const column = position % gridSize;
    let nextPosition = position;

    switch (event.key) {
      case 'ArrowLeft':
        if (column > 0) nextPosition -= 1;
        break;
      case 'ArrowRight':
        if (column < gridSize - 1) nextPosition += 1;
        break;
      case 'ArrowUp':
        if (row > 0) nextPosition -= gridSize;
        break;
      case 'ArrowDown':
        if (row < gridSize - 1) nextPosition += gridSize;
        break;
      case 'Home':
        nextPosition = 0;
        break;
      case 'End':
        nextPosition = board.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    setFocusedTile(nextPosition);
  };

  const instructions = (
    <ul className="grid gap-2 text-xs font-medium">
      <li className="flex items-start gap-2">
        <span className="bg-sage/20 text-navy mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-black">
          1
        </span>
        <span>{t('pictureForge.instructions.preview')}</span>
      </li>
      <li className="flex items-start gap-2">
        <span className="bg-sage/20 text-navy mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-black">
          2
        </span>
        <span>{t('pictureForge.instructions.swap')}</span>
      </li>
      <li className="flex items-start gap-2">
        <span className="bg-sage/20 text-navy mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-black">
          3
        </span>
        <span>{t('pictureForge.instructions.keyboard')}</span>
      </li>
    </ul>
  );

  const status =
    phase === 'ready' ? undefined : (
      <dl className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
        <PuzzleStat
          icon={Activity}
          label={t('pictureForge.moves')}
          value={moves}
        />
        <PuzzleStat
          icon={Grid3X3}
          label={t('pictureForge.pieces')}
          value={activeDifficulty.tileCount}
        />
        <PuzzleStat
          icon={Clock}
          label={t('pictureForge.elapsed')}
          value={t('pictureForge.secondsValue', { seconds: elapsedSeconds })}
        />
      </dl>
    );

  return (
    <GamePageShell
      title={t('games.pictureForge.title')}
      description={t('games.pictureForge.description')}
      icon={ImageIcon}
      accent="sage"
      instructions={instructions}
      status={status}
      playAreaLabel={t('games.pictureForge.title')}
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {phase === 'ready' ? (
        <div className="relative isolate -m-5 sm:-m-7 flex flex-col justify-center overflow-hidden rounded-[2rem] p-5 sm:p-7">
          {/* Background Decorative Ambient Orbs */}
          <div
            className="pointer-events-none absolute -top-16 -left-16 size-72 rounded-full bg-sage/25 blur-3xl opacity-75"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -top-16 -right-16 size-72 rounded-full bg-amber/20 blur-3xl opacity-70"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-16 -left-16 size-72 rounded-full bg-sky/20 blur-3xl opacity-60"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-16 -right-16 size-72 rounded-full bg-emerald-500/15 blur-3xl opacity-70"
            aria-hidden="true"
          />

          <div className="relative z-10 mx-auto w-full max-w-3xl">
            {/* Header */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-2.5 inline-block">
                <div
                  className="bg-sage/40 absolute -inset-1.5 rounded-xl blur-md opacity-70"
                  aria-hidden="true"
                />
                <div className="relative flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-sage to-emerald-600 text-white shadow-xs">
                  <ImageIcon className="size-5" aria-hidden="true" />
                </div>
              </div>

              <h2 className="text-navy text-xl font-black tracking-tight sm:text-2xl">
                {t('pictureForge.readyTitle')}
              </h2>
              <p className="text-muted-foreground mt-1 max-w-md text-xs leading-relaxed sm:text-sm">
                {t('pictureForge.readyDescription')}
              </p>
            </div>

            {/* Main Selector Section */}
            <div className="mt-5 grid items-start gap-4 sm:grid-cols-[12rem_1fr]">
              {/* Left Preview Image */}
              <div className="border-sage/25 bg-card/80 flex flex-col items-center rounded-2xl border p-2.5 shadow-card backdrop-blur-xs">
                <Image
                  src={selectedPuzzle.src}
                  width={512}
                  height={512}
                  sizes="192px"
                  alt={t(`pictureForge.imageAlts.${selectedPuzzle.id}`)}
                  className="aspect-square h-auto w-full rounded-xl object-cover shadow-2xs"
                />
                <span className="text-navy mt-2 block w-full truncate text-center text-xs font-black">
                  {t(`pictureForge.imageNames.${selectedPuzzle.id}`)}
                </span>
              </div>

              {/* Right Controls */}
              <div className="flex flex-col gap-3.5">
                <fieldset>
                  <legend className="text-navy text-[0.6875rem] font-black uppercase tracking-wider">
                    {t('pictureForge.imageChoiceLabel')}
                  </legend>
                  <div className="mt-1.5 grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {PICTURE_FORGE_PUZZLES.map((puzzle) => {
                      const selected = puzzle.id === selectedPuzzleId;
                      return (
                        <button
                          key={puzzle.id}
                          type="button"
                          aria-pressed={selected}
                          title={t(`pictureForge.imageNames.${puzzle.id}`)}
                          onClick={() => setSelectedPuzzleId(puzzle.id)}
                          className={cn(
                            'group relative aspect-square cursor-pointer overflow-hidden rounded-xl border-2 bg-card shadow-2xs outline-none transition-all duration-150 hover:scale-105 focus-visible:ring-4 focus-visible:ring-sage/35',
                            selected
                              ? 'border-sage-dark ring-sage/40 ring-2 scale-[1.05] shadow-xs'
                              : 'border-border/80 hover:border-sage/50'
                          )}
                        >
                          <Image
                            src={puzzle.src}
                            width={160}
                            height={160}
                            sizes="80px"
                            alt={t(`pictureForge.imageAlts.${puzzle.id}`)}
                            className="size-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="text-navy text-[0.6875rem] font-black uppercase tracking-wider">
                    {t('pictureForge.difficultyLabel')}
                  </legend>
                  <div className="mt-1.5 grid grid-cols-3 gap-2">
                    {PICTURE_FORGE_DIFFICULTIES.map((difficulty) => {
                      const selected = difficulty.id === selectedDifficultyId;
                      return (
                        <button
                          key={difficulty.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setSelectedDifficultyId(difficulty.id)}
                          className={cn(
                            'cursor-pointer rounded-xl border-2 px-2.5 py-1.5 text-center shadow-2xs outline-none transition-all duration-150 hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-sage/35',
                            selected
                              ? 'border-sage-dark bg-sage/15 ring-sage/40 ring-2 shadow-xs'
                              : 'border-border/80 bg-card hover:border-sage/50'
                          )}
                        >
                          <span className="text-navy block text-xs font-black">
                            {t(`pictureForge.difficultyNames.${difficulty.id}`)}
                          </span>
                          <span className="text-muted-foreground block text-[0.625rem] font-semibold">
                            {t('pictureForge.piecesValue', {
                              pieces: difficulty.tileCount,
                            })}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="pt-1 text-center sm:text-left">
                  <button
                    type="button"
                    onClick={startChallenge}
                    className="shadow-card inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy via-navy to-navy-light px-7 py-2.5 text-sm font-extrabold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-4 focus-visible:ring-navy/35 active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none"
                  >
                    <RefreshCw
                      className="size-3.5 transition-transform duration-200 group-hover:rotate-180"
                      aria-hidden="true"
                    />
                    <span>{t('pictureForge.start')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {phase !== 'ready' ? (
        <div className="mx-auto max-w-4xl">
          {phase === 'completed' ? (
            <div className="border-sage/40 bg-sage/10 mb-5 flex items-start gap-3.5 rounded-2xl border p-4 shadow-2xs">
              <CheckCircle2
                className="text-sage-dark mt-0.5 size-5 shrink-0"
                aria-hidden="true"
              />
              <div>
                <h2 className="text-navy text-base font-black">
                  {t('pictureForge.completeTitle')}
                </h2>
                <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed sm:text-sm">
                  {t('pictureForge.completeDescription', {
                    moves,
                    seconds: elapsedSeconds,
                  })}
                </p>
              </div>
            </div>
          ) : null}

          {/* Action Toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-navy flex items-center gap-2 text-xs font-black uppercase tracking-wider">
              <span className="bg-sage/15 text-sage-dark flex size-6 items-center justify-center rounded-lg">
                <Grid3X3 className="size-3.5" aria-hidden="true" />
              </span>
              <span>{t('pictureForge.piecesValue', { pieces: activeDifficulty.tileCount })}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-bold"
                onClick={resetBoard}
                disabled={moves === 0 && phase === 'playing'}
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                {t('pictureForge.reset')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-bold"
                onClick={changeChallenge}
              >
                <ImageIcon className="size-3.5" aria-hidden="true" />
                {t('pictureForge.changeChallenge')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-bold"
                onClick={shuffleBoard}
              >
                <RefreshCw className="size-3.5" aria-hidden="true" />
                {t('pictureForge.shuffle')}
              </Button>
            </div>
          </div>

          <div className="grid items-start gap-5 sm:gap-6 md:grid-cols-[16rem_minmax(0,1fr)] lg:grid-cols-[18rem_minmax(0,1fr)]">
            {/* Enlarged Reference Preview Card */}
            <aside className="border-sage/25 bg-card/90 flex flex-col rounded-2xl border p-3.5 shadow-card">
              <div className="text-navy flex items-center gap-2 text-xs font-black">
                <span className="bg-sage/15 text-sage-dark flex size-6 items-center justify-center rounded-lg">
                  <Eye className="size-3.5" aria-hidden="true" />
                </span>
                <h3>{t('pictureForge.previewLabel')}</h3>
              </div>
              <Image
                src={activePuzzle.src}
                width={1_024}
                height={1_024}
                sizes="(max-width: 768px) 100vw, 288px"
                alt={t(`pictureForge.imageAlts.${activePuzzle.id}`)}
                className="border-border/60 mt-3 aspect-square h-auto w-full rounded-xl border object-cover shadow-2xs"
              />
              <p className="text-navy mt-2.5 text-center text-xs font-black truncate">
                {t(`pictureForge.imageNames.${activePuzzle.id}`)}
              </p>
            </aside>

            {/* Puzzle Board Grid */}
            <div
              className="border-sage/20 bg-muted/15 relative mx-auto grid aspect-square w-full max-w-[32rem] gap-2 rounded-3xl border p-2.5 shadow-card sm:p-3.5"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              }}
              role="group"
              aria-label={t('pictureForge.boardLabel', { gridSize })}
            >
              {board.map((tile, position) => {
                const coordinates = getPictureForgeTileCoordinates(
                  tile,
                  gridSize
                );
                const selected = selectedPosition === position;

                return (
                  <button
                    key={tile}
                    ref={(element) => {
                      if (element && focusedTile === position) element.focus();
                    }}
                    type="button"
                    disabled={phase === 'completed'}
                    aria-pressed={selected}
                    aria-label={t('pictureForge.tileLabel', {
                      position: position + 1,
                      tile: tile + 1,
                    })}
                    onClick={() => selectTile(position)}
                    onFocus={() => setFocusedTile(position)}
                    onKeyDown={(event) => handleTileKeyDown(event, position)}
                    className={cn(
                      'relative aspect-square cursor-pointer overflow-hidden rounded-xl border-2 bg-no-repeat shadow-2xs outline-none transition-all duration-150 focus-visible:z-10 focus-visible:ring-4 active:scale-[0.98] disabled:cursor-default motion-reduce:transform-none motion-reduce:transition-none sm:rounded-2xl',
                      selected
                        ? 'border-amber ring-amber/40 z-10 scale-[1.03] shadow-md ring-4'
                        : 'border-white/90 hover:scale-[1.02] hover:border-sky-light hover:shadow-xs'
                    )}
                    style={{
                      backgroundImage: `url(${activePuzzle.src})`,
                      backgroundPosition: `${(coordinates.column / (gridSize - 1)) * 100}% ${(coordinates.row / (gridSize - 1)) * 100}%`,
                      backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                    }}
                  >
                    {selected ? (
                      <span className="bg-amber text-navy absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full shadow-md sm:size-7">
                        <Check className="size-3.5 sm:size-4" aria-hidden="true" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </GamePageShell>
  );
}
