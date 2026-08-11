import { describe, expect, it } from 'vitest';

import {
  TWIN_TRACE_DIFFICULTIES,
  TWIN_TRACE_PAIR_IDS,
  beginTwinTracePlay,
  createTwinTraceGame,
  getTwinTraceCardAtSlot,
  isTwinTraceCardFaceUp,
  isTwinTraceInputLocked,
  resolveTwinTraceMismatch,
  selectTwinTraceCard,
} from './twin-trace';

describe('twin trace game', () => {
  it('starts the standard board in a locked preview with eight pairs', () => {
    const game = createTwinTraceGame('4x4', () => 0.5);

    expect(game.cards).toHaveLength(16);
    expect(game.pairIds).toHaveLength(8);
    expect(game.previewing).toBe(true);
    expect(isTwinTraceInputLocked(game)).toBe(true);
    expect(game.cards.every((card) => isTwinTraceCardFaceUp(game, card))).toBe(
      true
    );
  });

  it('uses 24 playable cards, twelve pairs, and a center slot for 5x5', () => {
    const game = createTwinTraceGame('5x5', () => 0.5);

    expect(game.gridSize).toBe(5);
    expect(game.cards).toHaveLength(24);
    expect(game.pairIds).toHaveLength(12);
    expect(game.emptySlotIndex).toBe(12);
    expect(getTwinTraceCardAtSlot(game, 12)).toBeNull();
    expect(getTwinTraceCardAtSlot(game, 13)).toBe(game.cards[12]);
  });

  it('conceals cards and unlocks input after the preview phase ends', () => {
    const game = createTwinTraceGame('4x4', () => 0.25);
    const playing = beginTwinTracePlay(game);

    expect(playing.previewing).toBe(false);
    expect(isTwinTraceInputLocked(playing)).toBe(false);
    expect(
      playing.cards.some((card) => isTwinTraceCardFaceUp(playing, card))
    ).toBe(false);
  });

  it('keeps a matching pair face up and counts one move', () => {
    const game = beginTwinTracePlay(createTwinTraceGame('4x4', () => 0.25));
    const pairId = game.pairIds[0];
    const pair = game.cards.filter((card) => card.pairId === pairId);

    const firstPick = selectTwinTraceCard(game, pair[0].id);
    const secondPick = selectTwinTraceCard(firstPick, pair[1].id);

    expect(secondPick.moves).toBe(1);
    expect(secondPick.matchedPairIds).toContain(pairId);
    expect(secondPick.selectedCardIds).toEqual([]);
    expect(isTwinTraceCardFaceUp(secondPick, pair[0])).toBe(true);
  });

  it('locks input until a mismatched pair is concealed', () => {
    const game = beginTwinTracePlay(createTwinTraceGame('4x4', () => 0.75));
    const first = game.cards[0];
    const second = game.cards.find((card) => card.pairId !== first.pairId);
    const third = game.cards.find(
      (card) => card.id !== first.id && card.id !== second?.id
    );
    expect(second).toBeDefined();
    expect(third).toBeDefined();

    const firstPick = selectTwinTraceCard(game, first.id);
    const secondPick = selectTwinTraceCard(firstPick, second!.id);

    expect(isTwinTraceInputLocked(secondPick)).toBe(true);
    expect(selectTwinTraceCard(secondPick, third!.id)).toBe(secondPick);

    const resolved = resolveTwinTraceMismatch(secondPick, [
      first.id,
      second!.id,
    ]);
    expect(resolved.selectedCardIds).toEqual([]);
    expect(resolved.moves).toBe(1);
  });

  it('ignores a stale mismatch resolution', () => {
    const game = beginTwinTracePlay(createTwinTraceGame('4x4', () => 0.1));
    const first = game.cards[0];
    const second = game.cards.find((card) => card.pairId !== first.pairId)!;
    const mismatch = selectTwinTraceCard(
      selectTwinTraceCard(game, first.id),
      second.id
    );

    expect(resolveTwinTraceMismatch(mismatch, ['stale-a', 'stale-b'])).toBe(
      mismatch
    );
  });

  it('finishes after the final pair for the selected difficulty is matched', () => {
    const game = beginTwinTracePlay(createTwinTraceGame('5x5', () => 0.9));
    const finalPairId = TWIN_TRACE_PAIR_IDS.at(-1)!;
    const finalPair = game.cards.filter(
      (card) => card.pairId === finalPairId
    );
    const nearlyComplete = {
      ...game,
      matchedPairIds: game.pairIds.slice(0, -1),
      moves: 11,
    };

    const completed = selectTwinTraceCard(
      selectTwinTraceCard(nearlyComplete, finalPair[0].id),
      finalPair[1].id
    );

    expect(completed.status).toBe('completed');
    expect(completed.moves).toBe(12);
    expect(completed.matchedPairIds).toHaveLength(12);
  });

  it('keeps the configured difficulty metadata stable', () => {
    expect(TWIN_TRACE_DIFFICULTIES.map((item) => item.gridSize)).toEqual([4, 5]);
  });
});
