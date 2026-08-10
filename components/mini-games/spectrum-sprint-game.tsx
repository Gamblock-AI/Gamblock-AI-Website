'use client';

import { CheckCircle2, Palette, Pause, Play, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { GamePageShell } from '@/components/mini-games/game-page-shell';
import { Button } from '@/components/ui/button';
import {
  COLOR_SPRINT_COLORS,
  COLOR_SPRINT_ROUND_COUNT,
  COLOR_SPRINT_ROUND_DURATION_MS,
  calculateColorSprintResult,
  createColorSprintRounds,
  createRoundTimer,
  evaluateColorSprintAnswer,
  getRoundElapsedMs,
  getRoundRemainingMs,
  pauseRoundTimer,
  resumeRoundTimer,
  type ColorSprintAnswer,
  type ColorSprintColor,
  type ColorSprintRound,
  type RoundTimer,
} from '@/lib/mini-games/color-sprint';
import { cn } from '@/lib/utils';

type GamePhase = 'ready' | 'playing' | 'completed';

const COLOR_STYLES: Record<
  ColorSprintColor,
  { ink: string; answer: string }
> = {
  blue: {
    ink: 'text-blue-600',
    answer:
      'border-blue-700 bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-300',
  },
  yellow: {
    ink: 'text-amber-500',
    answer:
      'border-amber-500 bg-amber-300 text-navy hover:bg-amber-400 focus-visible:ring-amber-300',
  },
  red: {
    ink: 'text-crimson',
    answer:
      'border-crimson-dark bg-crimson text-white hover:bg-crimson-dark focus-visible:ring-crimson/35',
  },
  green: {
    ink: 'text-sage-dark',
    answer:
      'border-sage-dark bg-sage text-white hover:bg-sage-dark focus-visible:ring-sage/35',
  },
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-border bg-muted/30 rounded-xl border px-3 py-2.5">
      <dt className="text-muted-foreground text-xs font-semibold">{label}</dt>
      <dd className="text-navy mt-0.5 text-base font-extrabold">{value}</dd>
    </div>
  );
}

export function SpectrumSprintGame() {
  const t = useTranslations('miniGames');
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [rounds, setRounds] = useState<ColorSprintRound[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [answers, setAnswers] = useState<ColorSprintAnswer[]>([]);
  const [remainingMs, setRemainingMs] = useState(
    COLOR_SPRINT_ROUND_DURATION_MS
  );
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [visibilityPaused, setVisibilityPaused] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const timerRef = useRef<RoundTimer | null>(null);
  const submissionLockedRef = useRef(false);

  const isPaused = manuallyPaused || visibilityPaused;
  const activeRound = rounds[roundIndex];
  const score = useMemo(
    () => answers.reduce((total, answer) => total + Number(answer.correct), 0),
    [answers]
  );
  const result = useMemo(() => calculateColorSprintResult(answers), [answers]);
  const secondsLeft = Math.ceil(remainingMs / 1_000);

  const startGame = useCallback(() => {
    const now = performance.now();
    setRounds(createColorSprintRounds());
    setRoundIndex(0);
    setAnswers([]);
    setRemainingMs(COLOR_SPRINT_ROUND_DURATION_MS);
    setManuallyPaused(false);
    setVisibilityPaused(document.hidden);
    setAnnouncement('');
    timerRef.current = createRoundTimer(now);
    submissionLockedRef.current = false;
    setPhase('playing');
  }, []);

  const submitAnswer = useCallback(
    (selected: ColorSprintColor | null) => {
      if (
        phase !== 'playing' ||
        isPaused ||
        !activeRound ||
        submissionLockedRef.current
      ) {
        return;
      }

      submissionLockedRef.current = true;
      const now = performance.now();
      const responseMs = timerRef.current
        ? getRoundElapsedMs(timerRef.current, now)
        : COLOR_SPRINT_ROUND_DURATION_MS;
      const answer = evaluateColorSprintAnswer(
        activeRound,
        selected,
        responseMs
      );
      const nextAnswers = [...answers, answer];
      setAnswers(nextAnswers);

      if (answer.timedOut) {
        setAnnouncement(t('colorSprint.feedback.timeout'));
      } else if (answer.correct) {
        setAnnouncement(t('colorSprint.feedback.correct'));
      } else {
        setAnnouncement(t('colorSprint.feedback.wrong'));
      }

      if (roundIndex >= rounds.length - 1) {
        timerRef.current = null;
        setRemainingMs(0);
        setPhase('completed');
        return;
      }

      timerRef.current = createRoundTimer(now);
      setRemainingMs(COLOR_SPRINT_ROUND_DURATION_MS);
      setRoundIndex((current) => current + 1);
    }, [activeRound, answers, isPaused, phase, roundIndex, rounds.length, t]
  );

  useEffect(() => {
    submissionLockedRef.current = false;
  }, [roundIndex]);

  useEffect(() => {
    const updateVisibility = () => {
      const hidden = document.hidden;
      if (hidden && timerRef.current) {
        const now = performance.now();
        timerRef.current = pauseRoundTimer(timerRef.current, now);
        setRemainingMs(getRoundRemainingMs(timerRef.current, now));
      }
      setVisibilityPaused(hidden);
    };
    updateVisibility();
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  useEffect(() => {
    if (phase !== 'playing' || !timerRef.current) return;

    const now = performance.now();
    if (isPaused) {
      timerRef.current = pauseRoundTimer(timerRef.current, now);
      setRemainingMs(getRoundRemainingMs(timerRef.current, now));
      return;
    }

    timerRef.current = resumeRoundTimer(timerRef.current, now);
    setRemainingMs(getRoundRemainingMs(timerRef.current, now));

    const interval = window.setInterval(() => {
      if (!timerRef.current) return;
      setRemainingMs(
        getRoundRemainingMs(timerRef.current, performance.now())
      );
    }, 100);

    return () => window.clearInterval(interval);
  }, [isPaused, phase, roundIndex]);

  useEffect(() => {
    if (phase === 'playing' && !isPaused && remainingMs === 0) {
      submitAnswer(null);
    }
  }, [isPaused, phase, remainingMs, submitAnswer]);

  useEffect(() => {
    if (phase !== 'playing' || isPaused) return;

    const handleShortcut = (event: KeyboardEvent) => {
      const shortcutIndex = Number(event.key) - 1;
      const selected = COLOR_SPRINT_COLORS[shortcutIndex];
      if (!selected) return;
      event.preventDefault();
      submitAnswer(selected);
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [isPaused, phase, submitAnswer]);

  const instructions = (
    <ul className="grid gap-2">
      <li>{t('colorSprint.instructions.chooseInk')}</li>
      <li>{t('colorSprint.instructions.differentWord')}</li>
      <li>{t('colorSprint.instructions.keyboard')}</li>
    </ul>
  );

  const status =
    phase === 'ready' ? undefined : (
      <dl className="grid grid-cols-3 gap-2 xl:grid-cols-1">
        <Stat
          label={t('colorSprint.round', {
            current: Math.min(roundIndex + 1, COLOR_SPRINT_ROUND_COUNT),
            total: COLOR_SPRINT_ROUND_COUNT,
          })}
          value={`${Math.min(roundIndex + 1, COLOR_SPRINT_ROUND_COUNT)}/${COLOR_SPRINT_ROUND_COUNT}`}
        />
        <Stat label={t('colorSprint.score')} value={score} />
        <Stat
          label={t('colorSprint.timeLeft', { seconds: secondsLeft })}
          value={`${secondsLeft}s`}
        />
      </dl>
    );

  return (
    <GamePageShell
      title={t('games.colorSprint.title')}
      description={t('games.colorSprint.description')}
      icon={Palette}
      accent="sky"
      instructions={instructions}
      status={status}
      playAreaLabel={t('games.colorSprint.title')}
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {phase === 'ready' ? (
        <div className="mx-auto flex max-w-xl flex-col items-center py-8 text-center sm:py-12">
          <span className="bg-sky-light text-navy flex size-16 items-center justify-center rounded-2xl">
            <Palette className="size-8" aria-hidden="true" />
          </span>
          <h2 className="text-navy mt-5 text-2xl font-extrabold">
            {t('colorSprint.readyTitle')}
          </h2>
          <p className="text-muted-foreground mt-2 max-w-md text-sm leading-6 sm:text-base">
            {t('colorSprint.readyDescription')}
          </p>
          <Button className="mt-6 min-w-44" size="lg" onClick={startGame}>
            <Play aria-hidden="true" />
            {t('colorSprint.start')}
          </Button>
        </div>
      ) : null}

      {phase === 'playing' && activeRound ? (
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-navy text-sm font-bold">
                {t('colorSprint.round', {
                  current: roundIndex + 1,
                  total: COLOR_SPRINT_ROUND_COUNT,
                })}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {t('colorSprint.keyboardHint')}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setManuallyPaused((current) => !current);
                setAnnouncement(
                  manuallyPaused
                    ? t('colorSprint.resume')
                    : t('colorSprint.pausedTitle')
                );
              }}
              aria-pressed={manuallyPaused}
            >
              {manuallyPaused ? (
                <Play aria-hidden="true" />
              ) : (
                <Pause aria-hidden="true" />
              )}
              {manuallyPaused
                ? t('colorSprint.resume')
                : t('colorSprint.pause')}
            </Button>
          </div>

          <div
            className="bg-muted mt-4 h-2 overflow-hidden rounded-full"
            role="progressbar"
            aria-label={t('colorSprint.progressLabel')}
            aria-valuemin={0}
            aria-valuemax={COLOR_SPRINT_ROUND_DURATION_MS}
            aria-valuenow={Math.ceil(remainingMs)}
            aria-valuetext={t('colorSprint.timeLeft', {
              seconds: secondsLeft,
            })}
          >
            <div
              className="bg-sky h-full rounded-full transition-[width] duration-100 motion-reduce:transition-none"
              style={{
                width: `${(remainingMs / COLOR_SPRINT_ROUND_DURATION_MS) * 100}%`,
              }}
            />
          </div>

          {isPaused ? (
            <div className="border-navy/15 bg-azure/35 mt-6 flex min-h-72 flex-col items-center justify-center rounded-3xl border p-6 text-center">
              <Pause className="text-navy size-10" aria-hidden="true" />
              <h2 className="text-navy mt-4 text-xl font-extrabold">
                {t('colorSprint.pausedTitle')}
              </h2>
              <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-6">
                {t('colorSprint.pausedDescription')}
              </p>
              {manuallyPaused ? (
                <Button
                  className="mt-5"
                  onClick={() => setManuallyPaused(false)}
                >
                  <Play aria-hidden="true" />
                  {t('colorSprint.resume')}
                </Button>
              ) : null}
            </div>
          ) : (
            <>
              <div className="border-navy/10 bg-azure/30 mt-6 flex min-h-64 items-center justify-center rounded-3xl border px-5 py-10 shadow-inner">
                <p
                  className={cn(
                    'text-center text-5xl font-black tracking-tight uppercase sm:text-7xl',
                    COLOR_STYLES[activeRound.ink].ink
                  )}
                >
                  {t(`colorSprint.colors.${activeRound.word}`)}
                </p>
              </div>

              <p className="text-navy mt-6 text-center text-sm font-bold">
                {t('colorSprint.prompt')}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {COLOR_SPRINT_COLORS.map((color, index) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => submitAnswer(color)}
                    aria-keyshortcuts={`${index + 1}`}
                    aria-label={t('colorSprint.answerLabel', {
                      shortcut: index + 1,
                      color: t(`colorSprint.colors.${color}`),
                    })}
                    className={cn(
                      'focus-visible:ring-offset-card flex min-h-16 cursor-pointer items-center justify-between rounded-2xl border px-4 text-left text-sm font-extrabold shadow-sm outline-none transition-[transform,filter] hover:brightness-105 focus-visible:ring-4 focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none sm:min-h-20 sm:px-5 sm:text-base',
                      COLOR_STYLES[color].answer
                    )}
                  >
                    <span>{t(`colorSprint.colors.${color}`)}</span>
                    <kbd className="rounded-md border border-current/30 bg-white/15 px-2 py-1 text-xs font-bold">
                      {index + 1}
                    </kbd>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      ) : null}

      {phase === 'completed' ? (
        <div className="mx-auto max-w-2xl py-5 text-center sm:py-8">
          <span className="bg-sage/15 text-sage-dark mx-auto flex size-16 items-center justify-center rounded-2xl">
            <CheckCircle2 className="size-8" aria-hidden="true" />
          </span>
          <h2 className="text-navy mt-5 text-2xl font-extrabold">
            {t('colorSprint.results.title')}
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">
            {t('colorSprint.results.description')}
          </p>

          <dl className="mt-6 grid gap-3 sm:grid-cols-3">
            <Stat
              label={t('colorSprint.results.accuracy')}
              value={`${result.accuracy}%`}
            />
            <Stat
              label={t('colorSprint.results.averageResponse')}
              value={t('colorSprint.results.averageResponseValue', {
                seconds: (result.averageResponseMs / 1_000).toFixed(1),
              })}
            />
            <Stat
              label={t('colorSprint.results.correct')}
              value={t('colorSprint.results.correctValue', {
                correct: result.correctCount,
                total: answers.length,
              })}
            />
          </dl>

          <Button className="mt-6" size="lg" onClick={startGame}>
            <RotateCcw aria-hidden="true" />
            {t('colorSprint.results.playAgain')}
          </Button>
        </div>
      ) : null}
    </GamePageShell>
  );
}
