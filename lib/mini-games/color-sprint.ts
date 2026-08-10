import { shuffle, type RandomSource } from './random';

export const COLOR_SPRINT_ROUND_COUNT = 12;
export const COLOR_SPRINT_ROUND_DURATION_MS = 5_000;

export const COLOR_SPRINT_COLORS = [
  'blue',
  'yellow',
  'red',
  'green',
] as const;

export type ColorSprintColor = (typeof COLOR_SPRINT_COLORS)[number];

export interface ColorSprintRound {
  word: ColorSprintColor;
  ink: ColorSprintColor;
}

export interface ColorSprintAnswer {
  selected: ColorSprintColor | null;
  correct: boolean;
  responseMs: number;
  timedOut: boolean;
}

export interface ColorSprintResult {
  correctCount: number;
  accuracy: number;
  averageResponseMs: number;
}

export interface RoundTimer {
  durationMs: number;
  elapsedMs: number;
  runningSince: number | null;
}

export function createColorSprintRounds(
  count = COLOR_SPRINT_ROUND_COUNT,
  rng: RandomSource = Math.random
): ColorSprintRound[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError('Round count must be a non-negative integer.');
  }

  const rounds: ColorSprintRound[] = [];
  let wordPool: ColorSprintColor[] = [];

  for (let index = 0; index < count; index += 1) {
    if (wordPool.length === 0) {
      wordPool = shuffle(COLOR_SPRINT_COLORS, rng);
    }

    const word = wordPool.pop() ?? COLOR_SPRINT_COLORS[0];
    const inkOptions = COLOR_SPRINT_COLORS.filter((color) => color !== word);
    const ink = shuffle(inkOptions, rng)[0];
    rounds.push({ word, ink });
  }

  return rounds;
}

export function evaluateColorSprintAnswer(
  round: ColorSprintRound,
  selected: ColorSprintColor | null,
  responseMs: number
): ColorSprintAnswer {
  const timedOut = selected === null;

  return {
    selected,
    correct: selected === round.ink,
    responseMs: Math.min(
      Math.max(responseMs, 0),
      COLOR_SPRINT_ROUND_DURATION_MS
    ),
    timedOut,
  };
}

export function calculateColorSprintResult(
  answers: readonly ColorSprintAnswer[]
): ColorSprintResult {
  if (answers.length === 0) {
    return { correctCount: 0, accuracy: 0, averageResponseMs: 0 };
  }

  let correctCount = 0;
  let totalResponseMs = 0;

  for (const answer of answers) {
    if (answer.correct) correctCount += 1;
    totalResponseMs += answer.responseMs;
  }

  return {
    correctCount,
    accuracy: Math.round((correctCount / answers.length) * 100),
    averageResponseMs: Math.round(totalResponseMs / answers.length),
  };
}

export function createRoundTimer(
  now: number,
  durationMs = COLOR_SPRINT_ROUND_DURATION_MS
): RoundTimer {
  return { durationMs, elapsedMs: 0, runningSince: now };
}

export function getRoundElapsedMs(timer: RoundTimer, now: number): number {
  const runningElapsed =
    timer.runningSince === null ? 0 : Math.max(0, now - timer.runningSince);

  return Math.min(timer.durationMs, timer.elapsedMs + runningElapsed);
}

export function getRoundRemainingMs(timer: RoundTimer, now: number): number {
  return Math.max(0, timer.durationMs - getRoundElapsedMs(timer, now));
}

export function pauseRoundTimer(timer: RoundTimer, now: number): RoundTimer {
  if (timer.runningSince === null) return timer;

  return {
    ...timer,
    elapsedMs: getRoundElapsedMs(timer, now),
    runningSince: null,
  };
}

export function resumeRoundTimer(timer: RoundTimer, now: number): RoundTimer {
  if (timer.runningSince !== null || timer.elapsedMs >= timer.durationMs) {
    return timer;
  }

  return { ...timer, runningSince: now };
}
