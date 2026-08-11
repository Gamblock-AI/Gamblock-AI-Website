import { shuffle } from '@/lib/mini-games/random';

export const TWIN_TRACE_PAIR_IDS = [
  'apple',
  'banana',
  'orange',
  'kiwi',
  'blueberry',
  'grapes',
  'dragonfruit',
  'pineapple',
  'coconut',
  'peach',
  'pear',
  'watermelon',
] as const;

export type TwinTracePairId = (typeof TWIN_TRACE_PAIR_IDS)[number];

export const TWIN_TRACE_DIFFICULTIES = [
  {
    id: '4x4',
    gridSize: 4,
    pairCount: 8,
    emptySlotIndex: null,
  },
  {
    id: '5x5',
    gridSize: 5,
    pairCount: 12,
    emptySlotIndex: 12,
  },
] as const;

export type TwinTraceDifficultyId =
  (typeof TWIN_TRACE_DIFFICULTIES)[number]['id'];

export interface TwinTraceCard {
  id: string;
  pairId: TwinTracePairId;
}

export interface TwinTraceGameState {
  difficulty: TwinTraceDifficultyId;
  gridSize: number;
  pairIds: TwinTracePairId[];
  emptySlotIndex: number | null;
  cards: TwinTraceCard[];
  selectedCardIds: string[];
  matchedPairIds: TwinTracePairId[];
  moves: number;
  status: 'playing' | 'completed';
  previewing: boolean;
}

function getTwinTraceDifficulty(
  difficulty: TwinTraceDifficultyId
): (typeof TWIN_TRACE_DIFFICULTIES)[number] {
  return (
    TWIN_TRACE_DIFFICULTIES.find((candidate) => candidate.id === difficulty) ??
    TWIN_TRACE_DIFFICULTIES[0]
  );
}

export function createTwinTraceDeck(
  pairIds: readonly TwinTracePairId[] = TWIN_TRACE_PAIR_IDS.slice(0, 8),
  rng: () => number = Math.random
): TwinTraceCard[] {
  const cards = pairIds.flatMap((pairId) => [
    { id: `${pairId}-a`, pairId },
    { id: `${pairId}-b`, pairId },
  ]);

  return shuffle(cards, rng);
}

export function createTwinTraceGame(
  difficulty: TwinTraceDifficultyId = '4x4',
  rng: () => number = Math.random
): TwinTraceGameState {
  const configuration = getTwinTraceDifficulty(difficulty);
  const pairIds = TWIN_TRACE_PAIR_IDS.slice(0, configuration.pairCount);

  return {
    difficulty: configuration.id,
    gridSize: configuration.gridSize,
    pairIds,
    emptySlotIndex: configuration.emptySlotIndex,
    cards: createTwinTraceDeck(pairIds, rng),
    selectedCardIds: [],
    matchedPairIds: [],
    moves: 0,
    status: 'playing',
    previewing: true,
  };
}

export function beginTwinTracePlay(
  state: TwinTraceGameState
): TwinTraceGameState {
  if (!state.previewing) return state;

  return { ...state, previewing: false };
}

export function getTwinTraceCardAtSlot(
  state: TwinTraceGameState,
  slotIndex: number
): TwinTraceCard | null {
  if (
    !Number.isInteger(slotIndex) ||
    slotIndex < 0 ||
    slotIndex >= state.gridSize * state.gridSize ||
    slotIndex === state.emptySlotIndex
  ) {
    return null;
  }

  const cardIndex =
    state.emptySlotIndex !== null && slotIndex > state.emptySlotIndex
      ? slotIndex - 1
      : slotIndex;

  return state.cards[cardIndex] ?? null;
}

export function isTwinTraceInputLocked(state: TwinTraceGameState): boolean {
  return (
    state.previewing ||
    state.selectedCardIds.length === 2 ||
    state.status === 'completed'
  );
}

export function isTwinTraceCardFaceUp(
  state: TwinTraceGameState,
  card: TwinTraceCard
): boolean {
  return (
    state.previewing ||
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
      matchedPairIds.length === state.pairIds.length ? 'completed' : 'playing',
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
