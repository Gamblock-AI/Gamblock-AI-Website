import { shuffle, type RandomSource } from './random';

export const PICTURE_FORGE_GRID_SIZE = 3;
export const PICTURE_FORGE_TILE_COUNT =
  PICTURE_FORGE_GRID_SIZE * PICTURE_FORGE_GRID_SIZE;

export type PictureForgeBoard = number[];

export interface PictureForgeTileCoordinates {
  row: number;
  column: number;
}

export function createSolvedPictureForgeBoard(): PictureForgeBoard {
  return Array.from({ length: PICTURE_FORGE_TILE_COUNT }, (_, index) => index);
}

export function countMisplacedPictureForgeTiles(
  board: readonly number[]
): number {
  return board.reduce(
    (count, tile, position) => count + (tile === position ? 0 : 1),
    0
  );
}

export function isPictureForgeSolved(board: readonly number[]): boolean {
  return (
    board.length === PICTURE_FORGE_TILE_COUNT &&
    countMisplacedPictureForgeTiles(board) === 0
  );
}

export function createPictureForgeBoard(
  rng: RandomSource = Math.random
): PictureForgeBoard {
  const solved = createSolvedPictureForgeBoard();

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = shuffle(solved, rng);
    if (countMisplacedPictureForgeTiles(candidate) >= 6) return candidate;
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
  tile: number
): PictureForgeTileCoordinates {
  return {
    row: Math.floor(tile / PICTURE_FORGE_GRID_SIZE),
    column: tile % PICTURE_FORGE_GRID_SIZE,
  };
}
