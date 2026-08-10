import { describe, expect, it } from 'vitest';

import {
  BRAIN_SUMMIT_QUESTION_BANK,
  advanceBrainSummit,
  answerBrainSummitQuestion,
  createBrainSummitGame,
  createBrainSummitQuestions,
  getBrainSummitScore,
  getCurrentBrainSummitQuestion,
} from './brain-summit';

describe('brain summit game', () => {
  it('keeps a 16-question bank with stable unique IDs', () => {
    const ids = BRAIN_SUMMIT_QUESTION_BANK.map((question) => question.id);

    expect(ids).toHaveLength(16);
    expect(new Set(ids).size).toBe(16);
    expect(BRAIN_SUMMIT_QUESTION_BANK).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'everest',
          correctOptionId: 'everest',
        }),
        expect.objectContaining({
          id: 'router',
          correctOptionId: 'connectNetworks',
        }),
      ])
    );
  });

  it('selects eight unique questions and shuffles every option set', () => {
    const questions = createBrainSummitQuestions(() => 0.42);

    expect(questions).toHaveLength(8);
    expect(new Set(questions.map((question) => question.id)).size).toBe(8);
    for (const question of questions) {
      expect(question.optionIds).toHaveLength(4);
      expect(question.optionIds).toContain(question.correctOptionId);
    }
  });

  it('rejects an invalid round size', () => {
    expect(() => createBrainSummitQuestions(() => 0.5, 0)).toThrow(RangeError);
    expect(() => createBrainSummitQuestions(() => 0.5, 17)).toThrow(
      RangeError
    );
  });

  it('records one immediate answer and prevents a second answer', () => {
    const game = createBrainSummitGame(() => 0.2, 1);
    const question = getCurrentBrainSummitQuestion(game)!;
    const answered = answerBrainSummitQuestion(
      game,
      question.correctOptionId
    );

    expect(answered.selectedOptionId).toBe(question.correctOptionId);
    expect(answered.answers).toEqual([
      {
        questionId: question.id,
        selectedOptionId: question.correctOptionId,
        correct: true,
      },
    ]);
    expect(getBrainSummitScore(answered)).toBe(1);

    const otherOption = question.optionIds.find(
      (optionId) => optionId !== question.correctOptionId
    )!;
    expect(answerBrainSummitQuestion(answered, otherOption)).toBe(answered);
  });

  it('advances only after an answer and completes on the final question', () => {
    const game = createBrainSummitGame(() => 0.6, 2);
    expect(advanceBrainSummit(game)).toBe(game);

    const firstQuestion = getCurrentBrainSummitQuestion(game)!;
    const firstAnswered = answerBrainSummitQuestion(
      game,
      firstQuestion.correctOptionId
    );
    const secondQuestionState = advanceBrainSummit(firstAnswered);

    expect(secondQuestionState.currentIndex).toBe(1);
    expect(secondQuestionState.selectedOptionId).toBeNull();

    const secondQuestion = getCurrentBrainSummitQuestion(secondQuestionState)!;
    const finalAnswered = answerBrainSummitQuestion(
      secondQuestionState,
      secondQuestion.correctOptionId
    );
    const completed = advanceBrainSummit(finalAnswered);

    expect(completed.status).toBe('completed');
    expect(getBrainSummitScore(completed)).toBe(2);
  });
});
