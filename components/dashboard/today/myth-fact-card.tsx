'use client';

import { useState, useSyncExternalStore } from 'react';
import { ArrowRight, Scale } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FadeSwap } from '@/components/common/fade-swap';
import { useDayOfYear } from '@/hooks/use-daily-rotation';
import { Link } from '@/i18n/routing';
import { MYTH_FACTS } from '@/lib/recovery/myth-facts';
import { getLocalDateString } from '@/lib/recovery/date';
import { ROUTES } from '@/routes';

const STORAGE_KEY = 'gamblock:myth-fact:v1';

type StoredAnswer = { date: string; choice: 'myth' | 'fact' } | null;

// Today's stored answer, read once per session on the client (SSR renders the
// unanswered state; localStorage is never touched during render on the server).
const subscribeNever = () => () => {};
let cachedStoredAnswer: StoredAnswer | undefined;
const getStoredAnswerSnapshot = (): StoredAnswer => {
  if (cachedStoredAnswer === undefined) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as StoredAnswer) : null;
      cachedStoredAnswer =
        parsed && parsed.date === getLocalDateString(new Date()) ? parsed : null;
    } catch {
      cachedStoredAnswer = null;
    }
  }
  return cachedStoredAnswer;
};
const getStoredAnswerServerSnapshot = (): StoredAnswer => null;

/**
 * Daily myth-vs-fact card: one psychoeducation statement, the user guesses,
 * the card flips to a calm explanation. One statement per day (deterministic
 * rotation), answered state persists locally for the day, nothing is sent
 * anywhere. Wrong guesses use neutral navy — never red, never shame.
 */
export function MythFactCard() {
  const t = useTranslations('mythFact');
  const dayIndex = useDayOfYear();
  const stored = useSyncExternalStore(
    subscribeNever,
    getStoredAnswerSnapshot,
    getStoredAnswerServerSnapshot
  );
  const [choice, setChoice] = useState<'myth' | 'fact' | null>(
    stored?.choice ?? null
  );

  const entry = MYTH_FACTS[dayIndex % MYTH_FACTS.length];
  const answered = choice !== null;
  const correct = answered && choice === entry.answer;

  const answer = (picked: 'myth' | 'fact') => {
    setChoice(picked);
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ date: getLocalDateString(new Date()), choice: picked })
      );
      cachedStoredAnswer = undefined;
    } catch {
      // Memory-only sessions simply lose the day marker.
    }
  };

  return (
    <section className="border-border bg-card shadow-soft flex h-full flex-col justify-between rounded-2xl border p-4">
      <div className="flex items-center gap-3 shrink-0">
        <span
          className="bg-azure/65 text-navy flex size-10 shrink-0 items-center justify-center rounded-xl"
          aria-hidden="true"
        >
          <Scale className="size-5" />
        </span>
        <h3 className="text-navy min-w-0 text-[0.9375rem] leading-6 font-bold">
          {t('title')}
        </h3>
      </div>
      <FadeSwap swapKey={answered ? 'answer' : `statement-${entry.key}`}>
        {!answered ? (
          <div className="mt-3 flex-1 flex flex-col justify-between">
            <p className="text-foreground text-sm leading-6 font-medium">
              {t(`${entry.key}Statement`)}
            </p>
            <div className="mt-auto pt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => answer('myth')}
                className="border-navy/20 text-navy hover:bg-azure/45 focus-visible:ring-navy/30 min-h-11 cursor-pointer rounded-xl border text-sm font-bold outline-none focus-visible:ring-2"
              >
                {t('answerMyth')}
              </button>
              <button
                type="button"
                onClick={() => answer('fact')}
                className="border-navy/20 text-navy hover:bg-azure/45 focus-visible:ring-navy/30 min-h-11 cursor-pointer rounded-xl border text-sm font-bold outline-none focus-visible:ring-2"
              >
                {t('answerFact')}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex-1 flex flex-col justify-between">
            <div>
              <p
                className={`text-sm font-bold ${correct ? 'text-sage-dark' : 'text-navy'}`}
              >
                {t(correct ? 'resultRight' : 'resultWrong', {
                  answer: t(entry.answer === 'myth' ? 'answerMyth' : 'answerFact'),
                })}
              </p>
              <p className="text-muted-foreground mt-1 text-sm leading-6">
                {t(`${entry.key}Explanation`)}
              </p>
            </div>
            <Link
              href={ROUTES.EDUCATION}
              className="text-navy hover:text-navy-light focus-visible:ring-navy/30 mt-auto pt-3 inline-flex min-h-11 items-center gap-1.5 rounded-lg text-sm font-bold outline-none focus-visible:ring-2"
            >
              {t('readMore')}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </FadeSwap>
    </section>
  );
}
