import { describe, expect, it } from 'vitest';

import {
  countMisplacedPictureForgeTiles,
  createPictureForgeBoard,
  createSolvedPictureForgeBoard,
  getPictureForgeTileCoordinates,
  isPictureForgeSolved,
  swapPictureForgeTiles,
} from './picture-forge';

describe('picture forge board', () => {
  it('always starts unsolved with at least six misplaced tiles', () => {
    const board = createPictureForgeBoard(() => 0.999);

    expect(board).toHaveLength(9);
    expect(new Set(board).size).toBe(9);
    expect(isPictureForgeSolved(board)).toBe(false);
    expect(countMisplacedPictureForgeTiles(board)).toBeGreaterThanOrEqual(6);
  });

  it('uses a valid fallback when the RNG repeatedly produces a solved board', () => {
    const board = createPictureForgeBoard(() => 0.999);

    expect(board).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 0]);
  });

  it('swaps two selected positions without mutating the source board', () => {
    const source = createSolvedPictureForgeBoard();
    const swapped = swapPictureForgeTiles(source, 0, 8);

    expect(swapped).toEqual([8, 1, 2, 3, 4, 5, 6, 7, 0]);
    expect(source).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(isPictureForgeSolved(swapPictureForgeTiles(swapped, 0, 8))).toBe(
      true
    );
  });

  it('maps a tile to its source image coordinates', () => {
    expect(getPictureForgeTileCoordinates(5)).toEqual({ row: 1, column: 2 });
    expect(getPictureForgeTileCoordinates(8)).toEqual({ row: 2, column: 2 });
  });
});
