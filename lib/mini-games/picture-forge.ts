import { shuffle, type RandomSource } from './random';

export const PICTURE_FORGE_GRID_SIZE = 3;
export const PICTURE_FORGE_TILE_COUNT =
  PICTURE_FORGE_GRID_SIZE * PICTURE_FORGE_GRID_SIZE;

export const PICTURE_FORGE_DIFFICULTIES = [
  { id: '3x3', gridSize: 3, tileCount: 9 },
  { id: '4x4', gridSize: 4, tileCount: 16 },
  { id: '5x5', gridSize: 5, tileCount: 25 },
] as const;

export type PictureForgeDifficultyId =
  (typeof PICTURE_FORGE_DIFFICULTIES)[number]['id'];

export const PICTURE_FORGE_PUZZLES = [
  {
    id: 'studyCorner',
    src: '/images/mini-games/picture-forge.webp',
  },
  {
    id: 'fruitMarket',
    src: '/images/mini-games/picture-forge/fruit-market.webp',
  },
  {
    id: 'berryGarden',
    src: '/images/mini-games/picture-forge/berry-garden.webp',
  },
  {
    id: 'tropicalPlatter',
    src: '/images/mini-games/picture-forge/tropical-platter.webp',
  },
  {
    id: 'orchardBasket',
    src: '/images/mini-games/picture-forge/orchard-basket.webp',
  },
  {
    id: 'citrusTable',
    src: '/images/mini-games/picture-forge/citrus-table.webp',
  },
] as const;

export type PictureForgePuzzleId = (typeof PICTURE_FORGE_PUZZLES)[number]['id'];

export type PictureForgeBoard = number[];

export interface PictureForgeTileCoordinates {
  row: number;
  column: number;
}

export function createSolvedPictureForgeBoard(
  gridSize = PICTURE_FORGE_GRID_SIZE
): PictureForgeBoard {
  return Array.from({ length: gridSize * gridSize }, (_, index) => index);
}

export function countMisplacedPictureForgeTiles(
  board: readonly number[]
): number {
  return board.reduce(
    (count, tile, position) => count + (tile === position ? 0 : 1),
    0
  );
}

export function isPictureForgeSolved(
  board: readonly number[],
  gridSize = PICTURE_FORGE_GRID_SIZE
): boolean {
  return (
    board.length === gridSize * gridSize &&
    countMisplacedPictureForgeTiles(board) === 0
  );
}

export function createPictureForgeBoard(
  gridSize = PICTURE_FORGE_GRID_SIZE,
  rng: RandomSource = Math.random
): PictureForgeBoard {
  const solved = createSolvedPictureForgeBoard(gridSize);
  const minimumMisplacedTiles = Math.max(2, Math.ceil(solved.length * (2 / 3)));

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = shuffle(solved, rng);
    if (countMisplacedPictureForgeTiles(candidate) >= minimumMisplacedTiles) {
      return candidate;
    }
  }

  // A one-step rotation is a deterministic fallback for pathological RNGs.
  return solved.map((_, index) => solved[(index + 1) % solved.length]);
}

export function swapPictureForgeTiles(
  board: readonly number[],
  firstPosition: number,
  secondPosition: number
): PictureForgeBoard {
  const lastPosition = board.length - 1;
  const validPositions =
    Number.isInteger(firstPosition) &&
    Number.isInteger(secondPosition) &&
    firstPosition >= 0 &&
    secondPosition >= 0 &&
    firstPosition <= lastPosition &&
    secondPosition <= lastPosition;

  if (!validPositions || firstPosition === secondPosition) return [...board];

  const nextBoard = [...board];
  [nextBoard[firstPosition], nextBoard[secondPosition]] = [
    nextBoard[secondPosition],
    nextBoard[firstPosition],
  ];
  return nextBoard;
}

export function getPictureForgeTileCoordinates(
  tile: number,
  gridSize = PICTURE_FORGE_GRID_SIZE
): PictureForgeTileCoordinates {
  return {
    row: Math.floor(tile / gridSize),
    column: tile % gridSize,
  };
}
