import { shuffle } from '@/lib/mini-games/random';

export const TWIN_TRACE_PAIR_IDS = [
  'bookOpen',
  'compass',
  'leaf',
  'lightbulb',
  'music',
  'rocket',
  'star',
  'telescope',
] as const;

export type TwinTracePairId = (typeof TWIN_TRACE_PAIR_IDS)[number];

export interface TwinTraceCard {
  id: string;
  pairId: TwinTracePairId;
}

export interface TwinTraceGameState {
  cards: TwinTraceCard[];
  selectedCardIds: string[];
  matchedPairIds: TwinTracePairId[];
  moves: number;
  status: 'playing' | 'completed';
}

export function createTwinTraceDeck(
  rng: () => number = Math.random
): TwinTraceCard[] {
  const cards = TWIN_TRACE_PAIR_IDS.flatMap((pairId) => [
    { id: `${pairId}-a`, pairId },
    { id: `${pairId}-b`, pairId },
  ]);

  return shuffle(cards, rng);
}

export function createTwinTraceGame(
  rng: () => number = Math.random
): TwinTraceGameState {
  return {
    cards: createTwinTraceDeck(rng),
    selectedCardIds: [],
    matchedPairIds: [],
    moves: 0,
    status: 'playing',
  };
}

export function isTwinTraceInputLocked(state: TwinTraceGameState): boolean {
  return state.selectedCardIds.length === 2 || state.status === 'completed';
}

export function isTwinTraceCardFaceUp(
  state: TwinTraceGameState,
  card: TwinTraceCard
): boolean {
  return (
    state.selectedCardIds.includes(card.id) ||
    state.matchedPairIds.includes(card.pairId)
  );
}

export function selectTwinTraceCard(
  state: TwinTraceGameState,
  cardId: string
): TwinTraceGameState {
  if (isTwinTraceInputLocked(state)) return state;

  const card = state.cards.find((candidate) => candidate.id === cardId);
  if (
    !card ||
    state.selectedCardIds.includes(cardId) ||
    state.matchedPairIds.includes(card.pairId)
  ) {
    return state;
  }

  if (state.selectedCardIds.length === 0) {
    return { ...state, selectedCardIds: [cardId] };
  }

  const firstCard = state.cards.find(
    (candidate) => candidate.id === state.selectedCardIds[0]
  );
  if (!firstCard) {
    return { ...state, selectedCardIds: [cardId] };
  }

  const moves = state.moves + 1;
  if (firstCard.pairId !== card.pairId) {
    return {
      ...state,
      moves,
      selectedCardIds: [firstCard.id, card.id],
    };
  }

  const matchedPairIds = [...state.matchedPairIds, card.pairId];
  return {
    ...state,
    matchedPairIds,
    moves,
    selectedCardIds: [],
    status:
      matchedPairIds.length === TWIN_TRACE_PAIR_IDS.length
        ? 'completed'
        : 'playing',
  };
}

export function resolveTwinTraceMismatch(
  state: TwinTraceGameState,
  expectedCardIds?: readonly [string, string]
): TwinTraceGameState {
  if (state.selectedCardIds.length !== 2) return state;

  if (
    expectedCardIds &&
    (state.selectedCardIds[0] !== expectedCardIds[0] ||
      state.selectedCardIds[1] !== expectedCardIds[1])
  ) {
    return state;
  }

  return { ...state, selectedCardIds: [] };
}
