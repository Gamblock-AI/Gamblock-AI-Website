import { describe, expect, it } from 'vitest';

import {
  PICTURE_FORGE_DIFFICULTIES,
  PICTURE_FORGE_PUZZLES,
  countMisplacedPictureForgeTiles,
  createPictureForgeBoard,
  createSolvedPictureForgeBoard,
  getPictureForgeTileCoordinates,
  isPictureForgeSolved,
  swapPictureForgeTiles,
} from './picture-forge';

describe('picture forge board', () => {
  it.each(PICTURE_FORGE_DIFFICULTIES)(
    'creates an unsolved $id board with the configured tile count',
    ({ gridSize, tileCount }) => {
      const board = createPictureForgeBoard(gridSize, () => 0.999);

      expect(board).toHaveLength(tileCount);
      expect(new Set(board).size).toBe(tileCount);
      expect(isPictureForgeSolved(board, gridSize)).toBe(false);
      expect(countMisplacedPictureForgeTiles(board)).toBeGreaterThanOrEqual(
        Math.ceil(tileCount * (2 / 3))
      );
    }
  );

  it('exposes at least five selectable puzzle images', () => {
    expect(PICTURE_FORGE_PUZZLES.length).toBeGreaterThanOrEqual(5);
    expect(new Set(PICTURE_FORGE_PUZZLES.map((puzzle) => puzzle.src)).size).toBe(
      PICTURE_FORGE_PUZZLES.length
    );
  });

  it('swaps two selected positions without mutating the source board', () => {
    const source = createSolvedPictureForgeBoard(3);
    const swapped = swapPictureForgeTiles(source, 0, 8);

    expect(swapped).toEqual([8, 1, 2, 3, 4, 5, 6, 7, 0]);
    expect(source).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(isPictureForgeSolved(swapPictureForgeTiles(swapped, 0, 8), 3)).toBe(
      true
    );
  });

  it('maps tiles to source image coordinates for each grid size', () => {
    expect(getPictureForgeTileCoordinates(5, 3)).toEqual({
      row: 1,
      column: 2,
    });
    expect(getPictureForgeTileCoordinates(14, 4)).toEqual({
      row: 3,
      column: 2,
    });
    expect(getPictureForgeTileCoordinates(24, 5)).toEqual({
      row: 4,
      column: 4,
    });
  });
});
