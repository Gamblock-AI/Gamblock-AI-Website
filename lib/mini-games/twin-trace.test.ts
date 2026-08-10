import { describe, expect, it } from 'vitest';

import {
  TWIN_TRACE_PAIR_IDS,
  createTwinTraceGame,
  isTwinTraceCardFaceUp,
  isTwinTraceInputLocked,
  resolveTwinTraceMismatch,
  selectTwinTraceCard,
} from './twin-trace';

describe('twin trace game', () => {
  it('creates eight pairs with unique card IDs', () => {
    const game = createTwinTraceGame(() => 0.5);

    expect(game.cards).toHaveLength(16);
    expect(new Set(game.cards.map((card) => card.id)).size).toBe(16);
    for (const pairId of TWIN_TRACE_PAIR_IDS) {
      expect(game.cards.filter((card) => card.pairId === pairId)).toHaveLength(
        2
      );
    }
  });

  it('keeps a matching pair face up and counts one move', () => {
    const game = createTwinTraceGame(() => 0.25);
    const pairId = TWIN_TRACE_PAIR_IDS[0];
    const pair = game.cards.filter((card) => card.pairId === pairId);

    const firstPick = selectTwinTraceCard(game, pair[0].id);
    const secondPick = selectTwinTraceCard(firstPick, pair[1].id);

    expect(secondPick.moves).toBe(1);
    expect(secondPick.matchedPairIds).toContain(pairId);
    expect(secondPick.selectedCardIds).toEqual([]);
    expect(isTwinTraceCardFaceUp(secondPick, pair[0])).toBe(true);
  });

  it('locks input until a mismatched pair is concealed', () => {
    const game = createTwinTraceGame(() => 0.75);
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
    const game = createTwinTraceGame(() => 0.1);
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

  it('finishes after the eighth pair is matched', () => {
    const game = createTwinTraceGame(() => 0.9);
    const finalPairId = TWIN_TRACE_PAIR_IDS.at(-1)!;
    const finalPair = game.cards.filter(
      (card) => card.pairId === finalPairId
    );
    const nearlyComplete = {
      ...game,
      matchedPairIds: TWIN_TRACE_PAIR_IDS.slice(0, -1),
      moves: 7,
    };

    const completed = selectTwinTraceCard(
      selectTwinTraceCard(nearlyComplete, finalPair[0].id),
      finalPair[1].id
    );

    expect(completed.status).toBe('completed');
    expect(completed.moves).toBe(8);
    expect(completed.matchedPairIds).toHaveLength(8);
  });
});
