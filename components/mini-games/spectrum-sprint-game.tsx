'use client';

import type { LucideIcon } from 'lucide-react';
import {
  CheckCircle2,
  Clock,
  Gamepad2,
  Palette,
  Pause,
  Play,
  RotateCcw,
  Target,
  Timer,
  Trophy,
  Zap,
} from 'lucide-react';
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
  { ink: string; answer: string; aura: string; blob: string }
> = {
  blue: {
    ink: 'text-blue-500',
    answer:
      'border-blue-400/60 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-blue-500/25 focus-visible:ring-blue-300',
    aura: 'border-blue-500/25 bg-blue-500/[0.04]',
    blob: 'bg-blue-500/20',
  },
  yellow: {
    ink: 'text-amber-400',
    answer:
      'border-amber-300 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-navy hover:from-amber-400 hover:to-amber-500 shadow-amber-500/25 focus-visible:ring-amber-300',
    aura: 'border-amber-400/25 bg-amber-400/[0.05]',
    blob: 'bg-amber-400/20',
  },
  red: {
    ink: 'text-crimson',
    answer:
      'border-crimson-light/50 bg-gradient-to-br from-crimson to-crimson-dark text-white hover:from-crimson-light hover:to-crimson shadow-crimson/25 focus-visible:ring-crimson/35',
    aura: 'border-crimson/25 bg-crimson/[0.04]',
    blob: 'bg-crimson/20',
  },
  green: {
    ink: 'text-emerald-500',
    answer:
      'border-emerald-400/50 bg-gradient-to-br from-emerald-500 to-sage-dark text-white hover:from-emerald-600 hover:to-sage-dark shadow-emerald-500/25 focus-visible:ring-emerald-300',
    aura: 'border-emerald-500/25 bg-emerald-500/[0.04]',
    blob: 'bg-emerald-500/20',
  },
};

function StatCard({
  icon: Icon,
  label,
  value,
  tone = 'navy',
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: 'navy' | 'sky' | 'amber';
}) {
  const toneMap = {
    navy: 'text-navy bg-navy/10',
    sky: 'text-sky-dark bg-sky/15',
    amber: 'text-amber-dark bg-amber/15',
  };
  return (
    <div className="border-border/70 bg-muted/15 flex items-center gap-3 rounded-xl border px-3 py-2 shadow-2xs">
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-lg shadow-2xs',
          toneMap[tone]
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
        <dt className="text-muted-foreground truncate text-xs font-semibold">
          {label}
        </dt>
        <dd className="text-navy font-mono text-sm font-black">{value}</dd>
      </div>
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
    },
    [activeRound, answers, isPaused, phase, roundIndex, rounds.length, t]
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
    return () =>
      document.removeEventListener('visibilitychange', updateVisibility);
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
      setRemainingMs(getRoundRemainingMs(timerRef.current, performance.now()));
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
    <ul className="grid gap-2 text-xs font-medium">
      <li className="flex items-start gap-2">
        <span className="bg-sky/20 text-navy mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-black">
          1
        </span>
        <span>{t('colorSprint.instructions.chooseInk')}</span>
      </li>
      <li className="flex items-start gap-2">
        <span className="bg-sky/20 text-navy mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-black">
          2
        </span>
        <span>{t('colorSprint.instructions.differentWord')}</span>
      </li>
      <li className="flex items-start gap-2">
        <span className="bg-sky/20 text-navy mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-black">
          3
        </span>
        <span>{t('colorSprint.instructions.keyboard')}</span>
      </li>
    </ul>
  );

  const status =
    phase === 'ready' ? undefined : (
      <dl className="grid gap-2.5 sm:grid-cols-3 xl:grid-cols-1">
        <StatCard
          icon={Gamepad2}
          tone="navy"
          label={t('colorSprint.round', {
            current: Math.min(roundIndex + 1, COLOR_SPRINT_ROUND_COUNT),
            total: COLOR_SPRINT_ROUND_COUNT,
          })}
          value={`${Math.min(roundIndex + 1, COLOR_SPRINT_ROUND_COUNT)}/${COLOR_SPRINT_ROUND_COUNT}`}
        />
        <StatCard
          icon={Trophy}
          tone="amber"
          label={t('colorSprint.score')}
          value={score}
        />
        <StatCard
          icon={Timer}
          tone="sky"
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
        <div className="relative isolate -m-5 sm:-m-7 flex min-h-[480px] flex-col items-center justify-center overflow-hidden rounded-[2rem] p-6 text-center sm:p-12">
          {/* Background Decorative Spectrum Orbs filling the entire card */}
          <div
            className="pointer-events-none absolute -top-20 -left-20 size-72 rounded-full bg-sky/25 blur-3xl opacity-75"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-amber/20 blur-3xl opacity-75"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-crimson/15 blur-3xl opacity-65"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-20 -right-20 size-72 rounded-full bg-sage/20 blur-3xl opacity-75"
            aria-hidden="true"
          />

          {/* Subtle Concentric Background Circles across full card */}
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky/15 opacity-55"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 size-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-sky/20 opacity-40"
            aria-hidden="true"
          />

          {/* Centered Content */}
          <div className="relative z-10 mx-auto flex max-w-lg flex-col items-center">
            {/* Icon Badge with Glow & Ring */}
            <div className="relative mb-6">
              <div
                className="bg-sky/40 absolute -inset-3 rounded-[2.25rem] blur-xl opacity-80"
                aria-hidden="true"
              />
              <div className="relative flex size-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-sky via-cyan-400 to-teal-400 text-navy shadow-[0_12px_32px_-6px_rgba(61,214,245,0.45)] ring-4 ring-sky/30 ring-offset-4 ring-offset-card sm:size-24">
                <Palette className="size-10 sm:size-12" aria-hidden="true" />
              </div>
            </div>

            {/* Heading */}
            <h2 className="max-w-md text-2xl font-black leading-tight tracking-tight text-navy sm:text-3xl lg:text-[2rem]">
              {t('colorSprint.readyTitle')}
            </h2>

            {/* Description */}
            <p className="mt-3.5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t('colorSprint.readyDescription')}
            </p>

            {/* Play Button */}
            <button
              type="button"
              onClick={startGame}
              className="group relative mt-8 inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-navy via-navy to-navy-light px-9 py-4 text-base font-extrabold text-white shadow-[0_12px_28px_-6px_rgba(22,41,76,0.35)] outline-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-6px_rgba(22,41,76,0.45)] focus-visible:ring-4 focus-visible:ring-navy/35 active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none"
            >
              <Play
                className="size-4 fill-current transition-transform duration-200 group-hover:scale-110"
                aria-hidden="true"
              />
              <span>{t('colorSprint.start')}</span>
            </button>
          </div>
        </div>
      ) : null}

      {phase === 'playing' && activeRound ? (
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="bg-navy/10 text-navy inline-flex items-center rounded-full px-3 py-1 text-xs font-black">
                {t('colorSprint.round', {
                  current: roundIndex + 1,
                  total: COLOR_SPRINT_ROUND_COUNT,
                })}
              </span>
              <span className="text-muted-foreground hidden text-xs font-medium sm:inline">
                {t('colorSprint.keyboardHint')}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl font-bold"
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
                <Play className="size-3.5" aria-hidden="true" />
              ) : (
                <Pause className="size-3.5" aria-hidden="true" />
              )}
              {manuallyPaused
                ? t('colorSprint.resume')
                : t('colorSprint.pause')}
            </Button>
          </div>

          {/* Countdown Progress Bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="text-muted-foreground/70 size-3.5" />
                {t('colorSprint.progressLabel')}
              </span>
              <span
                className={cn(
                  'font-mono font-extrabold transition-colors',
                  secondsLeft <= 2 ? 'text-crimson animate-pulse' : 'text-navy'
                )}
              >
                {t('colorSprint.timeLeft', { seconds: secondsLeft })}
              </span>
            </div>
            <div
              className="bg-muted/80 border-border/50 h-2.5 overflow-hidden rounded-full border"
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
                className={cn(
                  'h-full rounded-full transition-[width,background-color] duration-100 motion-reduce:transition-none',
                  secondsLeft <= 2
                    ? 'bg-gradient-to-r from-amber to-crimson'
                    : 'bg-gradient-to-r from-sky to-cyan-500'
                )}
                style={{
                  width: `${(remainingMs / COLOR_SPRINT_ROUND_DURATION_MS) * 100}%`,
                }}
              />
            </div>
          </div>

          {isPaused ? (
            <div className="border-navy/15 bg-azure/35 mt-6 flex min-h-72 flex-col items-center justify-center rounded-3xl border p-6 text-center">
              <div className="bg-navy/10 text-navy flex size-14 items-center justify-center rounded-2xl">
                <Pause className="size-7" aria-hidden="true" />
              </div>
              <h2 className="text-navy mt-4 text-xl font-extrabold">
                {t('colorSprint.pausedTitle')}
              </h2>
              <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
                {t('colorSprint.pausedDescription')}
              </p>
              {manuallyPaused ? (
                <Button
                  className="shadow-card mt-5 rounded-xl font-extrabold"
                  onClick={() => setManuallyPaused(false)}
                >
                  <Play className="fill-current" aria-hidden="true" />
                  {t('colorSprint.resume')}
                </Button>
              ) : null}
            </div>
          ) : (
            <>
              {/* Word Arena Stage */}
              <div
                className={cn(
                  'relative mt-5 flex min-h-48 items-center justify-center overflow-hidden rounded-2xl border p-6 shadow-inner transition-all duration-300 sm:min-h-56 sm:p-8',
                  COLOR_STYLES[activeRound.ink].aura
                )}
              >
                {/* Background Radial Blob */}
                <div
                  className={cn(
                    'pointer-events-none absolute size-56 rounded-full blur-3xl opacity-40 transition-all duration-500',
                    COLOR_STYLES[activeRound.ink].blob
                  )}
                  aria-hidden="true"
                />
                <p
                  className={cn(
                    'relative z-10 text-center text-5xl font-black tracking-tight uppercase select-none drop-shadow-sm transition-transform duration-150 active:scale-95 sm:text-6xl md:text-7xl',
                    COLOR_STYLES[activeRound.ink].ink
                  )}
                >
                  {t(`colorSprint.colors.${activeRound.word}`)}
                </p>
              </div>

              {/* Prompt & Color Options */}
              <div className="mt-5 flex items-center justify-center gap-1.5">
                <Palette className="text-sky-dark size-3.5" aria-hidden="true" />
                <p className="text-navy text-xs font-bold uppercase tracking-wider">
                  {t('colorSprint.prompt')}
                </p>
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:gap-3">
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
                      'group relative flex min-h-14 cursor-pointer items-center justify-between overflow-hidden rounded-xl border px-3.5 py-3 text-left font-black shadow-md outline-none transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-4 focus-visible:ring-offset-2 active:translate-y-0.5 active:scale-[0.98] sm:min-h-16 sm:px-4 sm:py-3.5 sm:text-base',
                      COLOR_STYLES[color].answer
                    )}
                  >
                    {/* Glass shine effect */}
                    <div
                      className="pointer-events-none absolute -top-12 -left-12 size-32 rotate-12 rounded-full bg-white/10 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                    <span className="tracking-wide text-sm sm:text-base">
                      {t(`colorSprint.colors.${color}`)}
                    </span>
                    <kbd className="shadow-2xs border-current/30 flex size-6 items-center justify-center rounded-lg border bg-black/15 font-mono text-xs font-black backdrop-blur-xs sm:size-7">
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
        <div className="mx-auto max-w-2xl py-6 text-center sm:py-10">
          <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber to-amber-500 text-white shadow-xl shadow-amber/25 sm:size-24">
            <Trophy className="size-10 sm:size-12" aria-hidden="true" />
          </div>
          <h2 className="text-navy mt-6 text-2xl font-black tracking-tight sm:text-3xl">
            {t('colorSprint.results.title')}
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-relaxed">
            {t('colorSprint.results.description')}
          </p>

          <dl className="mt-7 grid gap-4 sm:grid-cols-3">
            <div className="border-border/80 bg-muted/20 rounded-2xl border p-4.5 text-center shadow-2xs">
              <div className="bg-sky/15 text-sky-dark mx-auto mb-2 flex size-10 items-center justify-center rounded-xl">
                <Target className="size-5" />
              </div>
              <dt className="text-muted-foreground text-xs font-semibold">
                {t('colorSprint.results.accuracy')}
              </dt>
              <dd className="text-navy mt-1 text-2xl font-black">
                {result.accuracy}%
              </dd>
            </div>
            <div className="border-border/80 bg-muted/20 rounded-2xl border p-4.5 text-center shadow-2xs">
              <div className="bg-amber/15 text-amber-dark mx-auto mb-2 flex size-10 items-center justify-center rounded-xl">
                <Zap className="size-5" />
              </div>
              <dt className="text-muted-foreground text-xs font-semibold">
                {t('colorSprint.results.averageResponse')}
              </dt>
              <dd className="text-navy mt-1 text-2xl font-black">
                {t('colorSprint.results.averageResponseValue', {
                  seconds: (result.averageResponseMs / 1_000).toFixed(1),
                })}
              </dd>
            </div>
            <div className="border-border/80 bg-muted/20 rounded-2xl border p-4.5 text-center shadow-2xs">
              <div className="bg-sage/15 text-sage-dark mx-auto mb-2 flex size-10 items-center justify-center rounded-xl">
                <CheckCircle2 className="size-5" />
              </div>
              <dt className="text-muted-foreground text-xs font-semibold">
                {t('colorSprint.results.correct')}
              </dt>
              <dd className="text-navy mt-1 text-2xl font-black">
                {t('colorSprint.results.correctValue', {
                  correct: result.correctCount,
                  total: answers.length,
                })}
              </dd>
            </div>
          </dl>

          <Button
            className="shadow-card mt-8 min-w-48 rounded-2xl py-6 text-base font-extrabold"
            size="lg"
            onClick={startGame}
          >
            <RotateCcw className="size-5" aria-hidden="true" />
            {t('colorSprint.results.playAgain')}
          </Button>
        </div>
      ) : null}
    </GamePageShell>
  );
}
