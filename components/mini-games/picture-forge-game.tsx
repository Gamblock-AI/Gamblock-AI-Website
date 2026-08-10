'use client';

import {
  Check,
  CheckCircle2,
  Eye,
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
  useRef,
  useState,
} from 'react';

import { GamePageShell } from '@/components/mini-games/game-page-shell';
import { Button } from '@/components/ui/button';
import {
  PICTURE_FORGE_GRID_SIZE,
  createPictureForgeBoard,
  createSolvedPictureForgeBoard,
  getPictureForgeTileCoordinates,
  isPictureForgeSolved,
  swapPictureForgeTiles,
  type PictureForgeBoard,
} from '@/lib/mini-games/picture-forge';
import { cn } from '@/lib/utils';

const PICTURE_PATH = '/images/mini-games/picture-forge.webp';

type PuzzlePhase = 'ready' | 'playing' | 'completed';

function PuzzleStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-border bg-muted/30 rounded-xl border px-3 py-2.5">
      <dt className="text-muted-foreground text-xs font-semibold">{label}</dt>
      <dd className="text-navy mt-0.5 text-base font-extrabold">{value}</dd>
    </div>
  );
}

export function PictureForgeGame() {
  const t = useTranslations('miniGames');
  const [phase, setPhase] = useState<PuzzlePhase>('ready');
  const [board, setBoard] = useState<PictureForgeBoard>(() =>
    createSolvedPictureForgeBoard()
  );
  const [initialBoard, setInitialBoard] = useState<PictureForgeBoard>(() =>
    createSolvedPictureForgeBoard()
  );
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [pageVisible, setPageVisible] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  const tileRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const shuffleBoard = useCallback(() => {
    const nextBoard = createPictureForgeBoard();
    setBoard(nextBoard);
    setInitialBoard(nextBoard);
    setSelectedPosition(null);
    setMoves(0);
    setElapsedSeconds(0);
    setAnnouncement('');
    setPhase('playing');
  }, []);

  const resetBoard = useCallback(() => {
    setBoard([...initialBoard]);
    setSelectedPosition(null);
    setMoves(0);
    setElapsedSeconds(0);
    setAnnouncement('');
    setPhase('playing');
  }, [initialBoard]);

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

      if (isPictureForgeSolved(nextBoard)) {
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
    }, [board, phase, selectedPosition, t]
  );

  const handleTileKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    position: number
  ) => {
    const row = Math.floor(position / PICTURE_FORGE_GRID_SIZE);
    const column = position % PICTURE_FORGE_GRID_SIZE;
    let nextPosition = position;

    switch (event.key) {
      case 'ArrowLeft':
        if (column > 0) nextPosition -= 1;
        break;
      case 'ArrowRight':
        if (column < PICTURE_FORGE_GRID_SIZE - 1) nextPosition += 1;
        break;
      case 'ArrowUp':
        if (row > 0) nextPosition -= PICTURE_FORGE_GRID_SIZE;
        break;
      case 'ArrowDown':
        if (row < PICTURE_FORGE_GRID_SIZE - 1) {
          nextPosition += PICTURE_FORGE_GRID_SIZE;
        }
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
    tileRefs.current[nextPosition]?.focus();
  };

  const instructions = (
    <ul className="grid gap-2">
      <li>{t('pictureForge.instructions.preview')}</li>
      <li>{t('pictureForge.instructions.swap')}</li>
      <li>{t('pictureForge.instructions.keyboard')}</li>
    </ul>
  );

  const status =
    phase === 'ready' ? undefined : (
      <dl className="grid grid-cols-2 gap-2 xl:grid-cols-1">
        <PuzzleStat label={t('pictureForge.moves')} value={moves} />
        <PuzzleStat
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
        <div className="mx-auto grid max-w-3xl items-center gap-7 py-4 sm:py-7 md:grid-cols-[minmax(0,20rem)_1fr]">
          <div className="border-navy/10 bg-azure/25 overflow-hidden rounded-3xl border p-2 shadow-soft">
            <Image
              src={PICTURE_PATH}
              width={1_024}
              height={1_024}
              sizes="(max-width: 768px) 85vw, 320px"
              alt={t('pictureForge.previewAlt')}
              className="aspect-square h-auto w-full rounded-2xl object-cover"
            />
          </div>
          <div className="text-center md:text-left">
            <span className="bg-sage/15 text-sage-dark mx-auto flex size-14 items-center justify-center rounded-2xl md:mx-0">
              <ImageIcon className="size-7" aria-hidden="true" />
            </span>
            <h2 className="text-navy mt-4 text-2xl font-extrabold">
              {t('pictureForge.readyTitle')}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6 sm:text-base">
              {t('pictureForge.readyDescription')}
            </p>
            <Button className="mt-5" size="lg" onClick={shuffleBoard}>
              <RefreshCw aria-hidden="true" />
              {t('pictureForge.start')}
            </Button>
          </div>
        </div>
      ) : null}

      {phase !== 'ready' ? (
        <div className="mx-auto max-w-3xl">
          {phase === 'completed' ? (
            <div className="border-sage/30 bg-sage/[0.08] mb-5 flex items-start gap-3 rounded-2xl border p-4">
              <CheckCircle2
                className="text-sage-dark mt-0.5 size-5 shrink-0"
                aria-hidden="true"
              />
              <div>
                <h2 className="text-navy font-extrabold">
                  {t('pictureForge.completeTitle')}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm leading-6">
                  {t('pictureForge.completeDescription', {
                    moves,
                    seconds: elapsedSeconds,
                  })}
                </p>
              </div>
            </div>
          ) : null}

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <dl className="flex gap-2">
              <PuzzleStat label={t('pictureForge.moves')} value={moves} />
              <PuzzleStat
                label={t('pictureForge.elapsed')}
                value={t('pictureForge.secondsValue', {
                  seconds: elapsedSeconds,
                })}
              />
            </dl>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={resetBoard}
                disabled={moves === 0 && phase === 'playing'}
              >
                <RotateCcw aria-hidden="true" />
                {t('pictureForge.reset')}
              </Button>
              <Button variant="outline" onClick={shuffleBoard}>
                <RefreshCw aria-hidden="true" />
                {t('pictureForge.shuffle')}
              </Button>
            </div>
          </div>

          <div className="grid items-start gap-5 md:grid-cols-[10rem_minmax(0,1fr)]">
            <aside className="border-border bg-muted/25 rounded-2xl border p-3">
              <div className="text-navy flex items-center gap-2 text-xs font-bold">
                <Eye className="size-4" aria-hidden="true" />
                <h3>{t('pictureForge.previewLabel')}</h3>
              </div>
              <Image
                src={PICTURE_PATH}
                width={1_024}
                height={1_024}
                sizes="160px"
                alt={t('pictureForge.previewAlt')}
                className="mt-3 aspect-square h-auto w-full rounded-xl object-cover"
              />
            </aside>

            <div
              className="border-navy/10 bg-azure/25 mx-auto grid aspect-square w-full max-w-[31rem] grid-cols-3 gap-1.5 rounded-2xl border p-1.5 shadow-inner sm:gap-2 sm:p-2"
              role="group"
              aria-label={t('pictureForge.boardLabel')}
            >
              {board.map((tile, position) => {
                const coordinates = getPictureForgeTileCoordinates(tile);
                const selected = selectedPosition === position;

                return (
                  <button
                    key={tile}
                    ref={(element) => {
                      tileRefs.current[position] = element;
                    }}
                    type="button"
                    disabled={phase === 'completed'}
                    aria-pressed={selected}
                    aria-label={t('pictureForge.tileLabel', {
                      position: position + 1,
                      tile: tile + 1,
                    })}
                    onClick={() => selectTile(position)}
                    onKeyDown={(event) => handleTileKeyDown(event, position)}
                    className={cn(
                      'focus-visible:ring-navy/45 relative aspect-square cursor-pointer overflow-hidden rounded-xl border-2 bg-no-repeat shadow-sm outline-none transition-[border-color,box-shadow,transform] focus-visible:z-10 focus-visible:ring-4 active:scale-[0.98] disabled:cursor-default motion-reduce:transform-none motion-reduce:transition-none',
                      selected
                        ? 'border-amber ring-amber/35 z-10 ring-4'
                        : 'border-white/80 hover:border-sky'
                    )}
                    style={{
                      backgroundImage: `url(${PICTURE_PATH})`,
                      backgroundPosition: `${coordinates.column * 50}% ${coordinates.row * 50}%`,
                      backgroundSize: '300% 300%',
                    }}
                  >
                    {selected ? (
                      <span className="bg-amber text-navy absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full shadow-sm">
                        <Check className="size-4" aria-hidden="true" />
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
