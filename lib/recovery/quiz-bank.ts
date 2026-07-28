/**
 * Local retrieval-practice quiz bank ("Kuis kilat"). The education API never
 * exposes correct answers to the client (grading is server-side and mutates
 * account progress), so this deliberately separate bank of general
 * psychoeducation questions is graded locally and touches no server state.
 * Strings live in the `quickQuiz` namespace; only stable keys and the correct
 * choice index live in code.
 */
export interface QuizBankEntry {
  key: `qq${number}`;
  choiceCount: 3;
  correct: 0 | 1 | 2;
}

export const QUIZ_BANK: readonly QuizBankEntry[] = [
  { key: 'qq1', choiceCount: 3, correct: 1 }, // urge wave duration
  { key: 'qq2', choiceCount: 3, correct: 0 }, // 10-second pause
  { key: 'qq3', choiceCount: 3, correct: 2 }, // naming feelings
  { key: 'qq4', choiceCount: 3, correct: 1 }, // environment design
  { key: 'qq5', choiceCount: 3, correct: 0 }, // sleep and control
  { key: 'qq6', choiceCount: 3, correct: 2 }, // house edge
  { key: 'qq7', choiceCount: 3, correct: 1 }, // near-miss effect
  { key: 'qq8', choiceCount: 3, correct: 0 }, // loss chasing
  { key: 'qq9', choiceCount: 3, correct: 2 }, // small intentions
  { key: 'qq10', choiceCount: 3, correct: 1 }, // grounding purpose
  { key: 'qq11', choiceCount: 3, correct: 0 }, // boredom trigger
  { key: 'qq12', choiceCount: 3, correct: 2 }, // variable rewards
  { key: 'qq13', choiceCount: 3, correct: 1 }, // slip response
  { key: 'qq14', choiceCount: 3, correct: 0 }, // pre-set limits
  { key: 'qq15', choiceCount: 3, correct: 2 }, // asking for support
] as const;

/** Three distinct daily questions: stride 5 over 15 guarantees distinctness. */
export function dailyQuizIndices(dayIndex: number): [number, number, number] {
  const base = dayIndex % QUIZ_BANK.length;
  return [
    base,
    (base + 5) % QUIZ_BANK.length,
    (base + 10) % QUIZ_BANK.length,
  ];
}
