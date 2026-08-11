'use client';

import {
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  MountainSnow,
  Play,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { GamePageShell } from '@/components/mini-games/game-page-shell';
import { Button } from '@/components/ui/button';
import {
  type BrainSummitGameState,
  advanceBrainSummit,
  answerBrainSummitQuestion,
  createBrainSummitGame,
  getBrainSummitScore,
  getCurrentBrainSummitQuestion,
} from '@/lib/mini-games/brain-summit';
import { cn } from '@/lib/utils';

export function BrainSummitGame() {
  const t = useTranslations('miniGames');
  const [game, setGame] = useState<BrainSummitGameState | null>(null);

  const startGame = () => setGame(createBrainSummitGame());
  const score = game ? getBrainSummitScore(game) : 0;
  const question = game ? getCurrentBrainSummitQuestion(game) : null;
  const answered = Boolean(game?.selectedOptionId);
  const selectedCorrect = Boolean(
    question && game?.selectedOptionId === question.correctOptionId
  );

  const status = game ? (
    <dl className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
      <div className="border-border/70 bg-muted/15 flex items-center justify-between rounded-xl border px-3.5 py-2 shadow-2xs">
        <dt className="text-muted-foreground text-xs font-semibold">
          {t('brainSummit.stats.progress')}
        </dt>
        <dd className="text-navy font-mono text-sm font-black">
          {game.currentIndex + 1} / {game.questions.length}
        </dd>
      </div>
      <div className="border-border/70 bg-muted/15 flex items-center justify-between rounded-xl border px-3.5 py-2 shadow-2xs">
        <dt className="text-muted-foreground text-xs font-semibold">
          {t('brainSummit.stats.score')}
        </dt>
        <dd className="text-navy font-mono text-sm font-black">
          {score}
        </dd>
      </div>
    </dl>
  ) : undefined;

  return (
    <GamePageShell
      title={t('games.brainSummit.title')}
      description={t('games.brainSummit.description')}
      eyebrow={t('games.brainSummit.category')}
      icon={MountainSnow}
      accent="navy"
      playAreaLabel={t('brainSummit.playAreaLabel')}
      instructions={
        <ul className="grid gap-2 text-xs font-medium">
          <li className="flex items-start gap-2">
            <span className="bg-navy/15 text-navy mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-black">
              1
            </span>
            <span>{t('brainSummit.instructions.answer')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-navy/15 text-navy mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-black">
              2
            </span>
            <span>{t('brainSummit.instructions.learn')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-navy/15 text-navy mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-black">
              3
            </span>
            <span>{t('brainSummit.instructions.finish')}</span>
          </li>
        </ul>
      }
      status={status}
      actions={
        game ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full rounded-xl font-bold"
            onClick={startGame}
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            {t('brainSummit.reset')}
          </Button>
        ) : undefined
      }
    >
      {!game ? (
        <div className="relative isolate -m-5 sm:-m-7 flex min-h-[480px] flex-col items-center justify-center overflow-hidden rounded-[2rem] p-6 text-center sm:p-12">
          {/* Background Decorative Ambient Orbs */}
          <div
            className="pointer-events-none absolute -top-20 -left-20 size-72 rounded-full bg-indigo-500/20 blur-3xl opacity-75"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-sky/20 blur-3xl opacity-70"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-violet-500/15 blur-3xl opacity-60"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-20 -right-20 size-72 rounded-full bg-teal-500/15 blur-3xl opacity-70"
            aria-hidden="true"
          />

          {/* Subtle Concentric Background Circles */}
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-500/15 opacity-55"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 size-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-indigo-500/20 opacity-40"
            aria-hidden="true"
          />

          {/* Centered Content */}
          <div className="relative z-10 mx-auto flex max-w-lg flex-col items-center">
            {/* Icon Badge with Glow & Ring */}
            <div className="relative mb-6">
              <div
                className="bg-navy/35 absolute -inset-3 rounded-[2.25rem] blur-xl opacity-80"
                aria-hidden="true"
              />
              <div className="relative flex size-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-navy via-indigo-700 to-sky-dark text-white shadow-[0_12px_32px_-6px_rgba(22,41,76,0.45)] ring-4 ring-navy/20 ring-offset-4 ring-offset-card sm:size-24">
                <MountainSnow className="size-10 sm:size-12" aria-hidden="true" />
              </div>
            </div>

            {/* Heading */}
            <h2 className="max-w-md text-2xl font-black leading-tight tracking-tight text-navy sm:text-3xl lg:text-[2rem]">
              {t('brainSummit.readyTitle')}
            </h2>

            {/* Description */}
            <p className="mt-3.5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t('brainSummit.readyDescription')}
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
              <span>{t('brainSummit.start')}</span>
            </button>
          </div>
        </div>
      ) : game.status === 'completed' ? (
        <div className="flex min-h-[28rem] flex-col items-center justify-center px-4 py-10 text-center">
          <span className="bg-sage/15 text-sage-dark flex size-20 items-center justify-center rounded-3xl">
            <CheckCircle2 className="size-9" aria-hidden="true" />
          </span>
          <h2 className="text-navy mt-6 text-2xl font-extrabold tracking-[-0.03em]">
            {t('brainSummit.completedTitle')}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md text-sm leading-6">
            {t('brainSummit.completedDescription', {
              score,
              total: game.questions.length,
            })}
          </p>
          <Button
            type="button"
            variant="wellness"
            size="lg"
            className="mt-7"
            onClick={startGame}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            {t('brainSummit.playAgain')}
          </Button>
        </div>
      ) : question ? (
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-4">
            <p className="text-navy-light text-xs font-bold tracking-[0.1em] uppercase">
              {t(`brainSummit.categories.${question.category}`)}
            </p>
            <p className="text-muted-foreground text-xs font-semibold">
              {t('brainSummit.questionProgress', {
                current: game.currentIndex + 1,
                total: game.questions.length,
              })}
            </p>
          </div>

          <div
            className="bg-muted mt-3 h-2 overflow-hidden rounded-full"
            role="progressbar"
            aria-label={t('brainSummit.stats.progress')}
            aria-valuemin={1}
            aria-valuemax={game.questions.length}
            aria-valuenow={game.currentIndex + 1}
          >
            <div
              className="bg-navy h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none"
              style={{
                width: `${((game.currentIndex + 1) / game.questions.length) * 100}%`,
              }}
            />
          </div>

          <div className="border-border/80 bg-card mt-6 rounded-[2rem] border p-5 shadow-card sm:p-7">
            <div className="text-navy flex items-start gap-3">
              <div className="bg-sky/15 text-sky-dark flex size-8 shrink-0 items-center justify-center rounded-xl">
                <CircleHelp className="size-5" aria-hidden="true" />
              </div>
              <h2
                id="brain-summit-question"
                className="text-lg leading-7 font-black sm:text-xl"
              >
                {t(`brainSummit.questions.${question.id}.prompt`)}
              </h2>
            </div>

            <div
              className="mt-6 grid gap-3 sm:grid-cols-2"
              role="group"
              aria-labelledby="brain-summit-question"
            >
              {question.optionIds.map((optionId, index) => {
                const isSelected = game.selectedOptionId === optionId;
                const isCorrect = question.correctOptionId === optionId;
                const revealCorrect = answered && isCorrect;
                const revealIncorrect = answered && isSelected && !isCorrect;

                return (
                  <button
                    key={optionId}
                    type="button"
                    className={cn(
                      'group relative flex min-h-16 cursor-pointer items-center gap-3.5 rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-bold shadow-2xs outline-none transition-all duration-150 focus-visible:ring-4',
                      revealCorrect
                        ? 'border-sage bg-sage/15 text-sage-dark shadow-sm'
                        : revealIncorrect
                          ? 'border-crimson bg-crimson/[0.08] text-crimson'
                          : 'border-border/80 bg-muted/15 text-navy hover:-translate-y-0.5 hover:border-navy/40 hover:bg-card hover:shadow-xs'
                    )}
                    aria-pressed={isSelected}
                    disabled={answered}
                    onClick={() =>
                      setGame((current) =>
                        current
                          ? answerBrainSummitQuestion(current, optionId)
                          : current
                      )
                    }
                  >
                    <span
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-black shadow-2xs transition-colors',
                        revealCorrect
                          ? 'bg-sage text-white'
                          : revealIncorrect
                            ? 'bg-crimson text-white'
                            : 'bg-card border border-border/80 text-navy group-hover:border-navy/40'
                      )}
                      aria-hidden="true"
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="min-w-0 flex-1 leading-relaxed">
                      {t(
                        `brainSummit.questions.${question.id}.options.${optionId}`
                      )}
                    </span>
                    {revealCorrect ? (
                      <CheckCircle2
                        className="text-sage-dark size-5 shrink-0"
                        aria-hidden="true"
                      />
                    ) : null}
                    {revealIncorrect ? (
                      <XCircle
                        className="text-crimson size-5 shrink-0"
                        aria-hidden="true"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {answered ? (
            <div
              id="brain-summit-feedback"
              className={cn(
                'mt-5 rounded-2xl border p-5 shadow-2xs transition-all',
                selectedCorrect
                  ? 'border-sage/40 bg-sage/10'
                  : 'border-amber/45 bg-amber/10'
              )}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                {selectedCorrect ? (
                  <CheckCircle2
                    className="text-sage-dark mt-0.5 size-5 shrink-0"
                    aria-hidden="true"
                  />
                ) : (
                  <XCircle
                    className="text-crimson mt-0.5 size-5 shrink-0"
                    aria-hidden="true"
                  />
                )}
                <div>
                  <h3 className="text-navy text-sm font-black">
                    {selectedCorrect
                      ? t('brainSummit.correct')
                      : t('brainSummit.incorrect')}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {t(
                      `brainSummit.questions.${question.id}.explanation`
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="shadow-card mt-4 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy via-navy to-navy-light px-6 py-2.5 text-sm font-extrabold text-white transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                aria-describedby="brain-summit-feedback"
                onClick={() =>
                  setGame((current) =>
                    current ? advanceBrainSummit(current) : current
                  )
                }
              >
                <span>
                  {game.currentIndex === game.questions.length - 1
                    ? t('brainSummit.seeResults')
                    : t('brainSummit.next')}
                </span>
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </GamePageShell>
  );
}
