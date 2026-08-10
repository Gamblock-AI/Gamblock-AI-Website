import { describe, expect, it } from 'vitest';

import {
  COLOR_SPRINT_ROUND_COUNT,
  calculateColorSprintResult,
  createColorSprintRounds,
  createRoundTimer,
  evaluateColorSprintAnswer,
  getRoundElapsedMs,
  getRoundRemainingMs,
  pauseRoundTimer,
  resumeRoundTimer,
} from './color-sprint';

describe('color sprint rounds', () => {
  it('creates twelve rounds whose word and ink never match', () => {
    const rounds = createColorSprintRounds(
      COLOR_SPRINT_ROUND_COUNT,
      () => 0.25
    );

    expect(rounds).toHaveLength(12);
    expect(rounds.every((round) => round.word !== round.ink)).toBe(true);
  });

  it('evaluates answers and includes timeouts in result timing', () => {
    const round = { word: 'red', ink: 'blue' } as const;
    const correct = evaluateColorSprintAnswer(round, 'blue', 1_200);
    const wrong = evaluateColorSprintAnswer(round, 'green', 2_300);
    const timeout = evaluateColorSprintAnswer(round, null, 5_000);

    expect(correct).toMatchObject({ correct: true, timedOut: false });
    expect(wrong).toMatchObject({ correct: false, timedOut: false });
    expect(timeout).toMatchObject({ correct: false, timedOut: true });
    expect(calculateColorSprintResult([correct, wrong, timeout])).toEqual({
      correctCount: 1,
      accuracy: 33,
      averageResponseMs: 2_833,
    });
  });
});

describe('color sprint round timer', () => {
  it('does not consume time while paused', () => {
    const started = createRoundTimer(1_000);
    const paused = pauseRoundTimer(started, 2_250);

    expect(getRoundElapsedMs(paused, 8_000)).toBe(1_250);
    expect(getRoundRemainingMs(paused, 8_000)).toBe(3_750);

    const resumed = resumeRoundTimer(paused, 8_000);
    expect(getRoundElapsedMs(resumed, 9_000)).toBe(2_250);
    expect(getRoundRemainingMs(resumed, 9_000)).toBe(2_750);
  });

  it('clamps elapsed and remaining time at the round duration', () => {
    const timer = createRoundTimer(500);

    expect(getRoundElapsedMs(timer, 8_000)).toBe(5_000);
    expect(getRoundRemainingMs(timer, 8_000)).toBe(0);
  });
});
