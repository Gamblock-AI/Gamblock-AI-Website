'use client';

import { useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { ArrowRight, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FadeSwap } from '@/components/common/fade-swap';
import { useDayOfYear } from '@/hooks/use-daily-rotation';
import { dailyQuizIndices, QUIZ_BANK } from '@/lib/recovery/quiz-bank';
import { getLocalDateString } from '@/lib/recovery/date';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'gamblock:quick-quiz:v1';

type StoredQuiz = { date: string; answers: number[] } | null;

const subscribeNever = () => () => {};
let cachedStoredQuiz: StoredQuiz | undefined;
const getStoredQuizSnapshot = (): StoredQuiz => {
  if (cachedStoredQuiz === undefined) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as StoredQuiz) : null;
      cachedStoredQuiz =
        parsed && parsed.date === getLocalDateString(new Date()) ? parsed : null;
    } catch {
      cachedStoredQuiz = null;
    }
  }
  return cachedStoredQuiz;
};
const getStoredQuizServerSnapshot = (): StoredQuiz => null;

function persistAnswers(answers: number[]) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ date: getLocalDateString(new Date()), answers })
    );
    cachedStoredQuiz = undefined;
  } catch {
    // Memory-only sessions simply lose the day marker.
  }
}

/**
 * "Kuis kilat" — three deterministic daily retrieval-practice questions from
 * the local psychoeducation bank. Graded locally, answered state persists for
 * the day, no server progress is touched. No scores kept across days, no
 * streaks — finishing is the whole reward.
 */
export function QuickQuiz() {
  const t = useTranslations('quickQuiz');
  const dayIndex = useDayOfYear();
  const stored = useSyncExternalStore(
    subscribeNever,
    getStoredQuizSnapshot,
    getStoredQuizServerSnapshot
  );
  const [answers, setAnswers] = useState<number[]>(stored?.answers ?? []);
  // Number of feedback screens already advanced past. A restored session
  // skips straight to the next unanswered question (or the finished state).
  const [revealed, setRevealed] = useState(stored?.answers.length ?? 0);

  const questions = dailyQuizIndices(dayIndex).map((index) => QUIZ_BANK[index]);
  const awaitingFeedback = answers.length > revealed;
  const finished = !awaitingFeedback && answers.length >= questions.length;
  const correctCount = answers.filter(
    (choice, position) => choice === questions[position]?.correct
  ).length;

  const choose = (choice: number) => {
    if (awaitingFeedback || finished) return;
    const next = [...answers, choice];
    setAnswers(next);
    persistAnswers(next);
  };

  const feedbackQuestion = awaitingFeedback ? questions[revealed] : null;
  const activeQuestion =
    !awaitingFeedback && !finished ? questions[answers.length] : null;

  return (
    <section className="border-border bg-card shadow-soft rounded-2xl border p-4 sm:p-5">
      <div className="flex items-center gap-2.5">
        <span
          className="bg-navy text-sky flex size-8 shrink-0 items-center justify-center rounded-lg"
          aria-hidden="true"
        >
          <Zap className="size-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-navy text-sm font-bold">{t('title')}</h2>
          <p className="text-muted-foreground text-xs leading-5">{t('intro')}</p>
        </div>
      </div>

      <FadeSwap
        swapKey={
          finished ? 'done' : awaitingFeedback ? `fb-${revealed}` : `q-${answers.length}`
        }
      >
        {finished ? (
          <div className="mt-3 flex items-center gap-3">
            <Image
              src="/images/mascot/gami-thumbsup.webp"
              alt=""
              width={56}
              height={56}
              className="size-12 shrink-0 object-contain"
            />
            <div>
              <p className="text-navy text-sm font-bold">
                {t('doneTitle', {
                  correct: correctCount,
                  total: questions.length,
                })}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs leading-5">
                {t('doneBody')}
              </p>
            </div>
          </div>
        ) : feedbackQuestion ? (
          <div className="mt-3">
            <p
              className={cn(
                'text-sm font-bold',
                answers[revealed] === feedbackQuestion.correct
                  ? 'text-sage-dark'
                  : 'text-navy'
              )}
            >
              {answers[revealed] === feedbackQuestion.correct
                ? t('resultRight')
                : t('resultWrong', {
                    answer: t(
                      `${feedbackQuestion.key}Choice${feedbackQuestion.correct + 1}`
                    ),
                  })}
            </p>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              {t(`${feedbackQuestion.key}Explanation`)}
            </p>
            <button
              type="button"
              onClick={() => setRevealed((value) => value + 1)}
              className="text-navy hover:text-navy-light focus-visible:ring-navy/30 mt-2 inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg text-sm font-bold outline-none focus-visible:ring-2"
            >
              {revealed === questions.length - 1 ? t('finish') : t('next')}
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : activeQuestion ? (
          <div className="mt-3">
            <p className="text-muted-foreground text-xs font-semibold">
              {t('progress', {
                current: answers.length + 1,
                total: questions.length,
              })}
            </p>
            <p className="text-foreground mt-1 text-sm leading-6 font-medium">
              {t(`${activeQuestion.key}Question`)}
            </p>
            <div className="mt-2.5 grid gap-2">
              {Array.from({ length: activeQuestion.choiceCount }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => choose(index)}
                  className="border-navy/15 text-navy hover:bg-azure/40 focus-visible:ring-navy/30 min-h-11 cursor-pointer rounded-xl border px-3 text-left text-sm font-semibold outline-none focus-visible:ring-2"
                >
                  {t(`${activeQuestion.key}Choice${index + 1}`)}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </FadeSwap>
    </section>
  );
}
