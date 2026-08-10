import { shuffle } from '@/lib/mini-games/random';

export type BrainSummitCategory =
  | 'geography'
  | 'science'
  | 'indonesia'
  | 'technology';

export interface BrainSummitQuestionDefinition {
  id: string;
  category: BrainSummitCategory;
  correctOptionId: string;
  optionIds: readonly string[];
}

export interface BrainSummitQuestion
  extends Omit<BrainSummitQuestionDefinition, 'optionIds'> {
  optionIds: string[];
}

export interface BrainSummitAnswer {
  questionId: string;
  selectedOptionId: string;
  correct: boolean;
}

export interface BrainSummitGameState {
  questions: BrainSummitQuestion[];
  currentIndex: number;
  answers: BrainSummitAnswer[];
  selectedOptionId: string | null;
  status: 'playing' | 'completed';
}

export const BRAIN_SUMMIT_QUESTION_BANK = [
  {
    id: 'everest',
    category: 'geography',
    correctOptionId: 'everest',
    optionIds: ['everest', 'k2', 'kilimanjaro', 'denali'],
  },
  {
    id: 'pacific',
    category: 'geography',
    correctOptionId: 'pacific',
    optionIds: ['pacific', 'atlantic', 'indian', 'arctic'],
  },
  {
    id: 'tokyo',
    category: 'geography',
    correctOptionId: 'tokyo',
    optionIds: ['tokyo', 'kyoto', 'osaka', 'sapporo'],
  },
  {
    id: 'giza',
    category: 'geography',
    correctOptionId: 'egypt',
    optionIds: ['egypt', 'jordan', 'morocco', 'turkey'],
  },
  {
    id: 'jupiter',
    category: 'science',
    correctOptionId: 'jupiter',
    optionIds: ['jupiter', 'saturn', 'earth', 'neptune'],
  },
  {
    id: 'mars',
    category: 'science',
    correctOptionId: 'mars',
    optionIds: ['mars', 'venus', 'mercury', 'uranus'],
  },
  {
    id: 'carbonDioxide',
    category: 'science',
    correctOptionId: 'carbonDioxide',
    optionIds: ['carbonDioxide', 'oxygen', 'nitrogen', 'hydrogen'],
  },
  {
    id: 'heart',
    category: 'science',
    correctOptionId: 'heart',
    optionIds: ['heart', 'lungs', 'liver', 'kidneys'],
  },
  {
    id: 'independence',
    category: 'indonesia',
    correctOptionId: '1945',
    optionIds: ['1945', '1942', '1949', '1950'],
  },
  {
    id: 'borobudur',
    category: 'indonesia',
    correctOptionId: 'centralJava',
    optionIds: ['centralJava', 'eastJava', 'westJava', 'bali'],
  },
  {
    id: 'laskarPelangi',
    category: 'indonesia',
    correctOptionId: 'andreaHirata',
    optionIds: ['andreaHirata', 'pramoedya', 'deeLestari', 'tereLiye'],
  },
  {
    id: 'pancasila',
    category: 'indonesia',
    correctOptionId: 'five',
    optionIds: ['five', 'three', 'four', 'six'],
  },
  {
    id: 'cpu',
    category: 'technology',
    correctOptionId: 'processor',
    optionIds: ['processor', 'storage', 'monitor', 'keyboard'],
  },
  {
    id: 'https',
    category: 'technology',
    correctOptionId: 'encryptedConnection',
    optionIds: [
      'encryptedConnection',
      'largerImages',
      'offlineMode',
      'fasterProcessor',
    ],
  },
  {
    id: 'binary',
    category: 'technology',
    correctOptionId: 'zeroOne',
    optionIds: ['zeroOne', 'oneTwo', 'az', 'zeroNine'],
  },
  {
    id: 'router',
    category: 'technology',
    correctOptionId: 'connectNetworks',
    optionIds: [
      'connectNetworks',
      'printDocuments',
      'editPhotos',
      'storePasswords',
    ],
  },
] as const satisfies readonly BrainSummitQuestionDefinition[];

export const BRAIN_SUMMIT_ROUND_SIZE = 8;

export function createBrainSummitQuestions(
  rng: () => number = Math.random,
  count = BRAIN_SUMMIT_ROUND_SIZE
): BrainSummitQuestion[] {
  if (
    !Number.isInteger(count) ||
    count < 1 ||
    count > BRAIN_SUMMIT_QUESTION_BANK.length
  ) {
    throw new RangeError(
      `Question count must be between 1 and ${BRAIN_SUMMIT_QUESTION_BANK.length}.`
    );
  }

  return shuffle([...BRAIN_SUMMIT_QUESTION_BANK], rng)
    .slice(0, count)
    .map((question) => ({
      ...question,
      optionIds: shuffle([...question.optionIds], rng),
    }));
}

export function createBrainSummitGame(
  rng: () => number = Math.random,
  count = BRAIN_SUMMIT_ROUND_SIZE
): BrainSummitGameState {
  return {
    questions: createBrainSummitQuestions(rng, count),
    currentIndex: 0,
    answers: [],
    selectedOptionId: null,
    status: 'playing',
  };
}

export function getCurrentBrainSummitQuestion(
  state: BrainSummitGameState
): BrainSummitQuestion | null {
  return state.questions[state.currentIndex] ?? null;
}

export function answerBrainSummitQuestion(
  state: BrainSummitGameState,
  optionId: string
): BrainSummitGameState {
  if (state.status !== 'playing' || state.selectedOptionId !== null) return state;

  const question = getCurrentBrainSummitQuestion(state);
  if (!question || !question.optionIds.includes(optionId)) return state;

  const correct = question.correctOptionId === optionId;
  return {
    ...state,
    selectedOptionId: optionId,
    answers: [
      ...state.answers,
      { questionId: question.id, selectedOptionId: optionId, correct },
    ],
  };
}

export function advanceBrainSummit(
  state: BrainSummitGameState
): BrainSummitGameState {
  if (state.status !== 'playing' || state.selectedOptionId === null) return state;

  if (state.currentIndex >= state.questions.length - 1) {
    return { ...state, status: 'completed' };
  }

  return {
    ...state,
    currentIndex: state.currentIndex + 1,
    selectedOptionId: null,
  };
}

export function getBrainSummitScore(state: BrainSummitGameState): number {
  return state.answers.reduce(
    (score, answer) => score + (answer.correct ? 1 : 0),
    0
  );
}
