'use client';

import {
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  MountainSnow,
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
    <dl className="grid grid-cols-2 gap-2 text-center xl:grid-cols-1 xl:text-left">
      <div className="bg-muted/55 rounded-xl px-3 py-2 xl:flex xl:items-center xl:justify-between">
        <dt className="text-muted-foreground text-xs font-semibold">
          {t('brainSummit.stats.progress')}
        </dt>
        <dd className="text-navy mt-1 text-base font-extrabold xl:mt-0">
          {Math.min(game.currentIndex + 1, game.questions.length)}/
          {game.questions.length}
        </dd>
      </div>
      <div className="bg-muted/55 rounded-xl px-3 py-2 xl:flex xl:items-center xl:justify-between">
        <dt className="text-muted-foreground text-xs font-semibold">
          {t('brainSummit.stats.score')}
        </dt>
        <dd className="text-navy mt-1 text-base font-extrabold xl:mt-0">
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
        <ol className="list-decimal space-y-2 pl-5">
          <li>{t('brainSummit.instructions.answer')}</li>
          <li>{t('brainSummit.instructions.learn')}</li>
          <li>{t('brainSummit.instructions.finish')}</li>
        </ol>
      }
      status={status}
      actions={
        game ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={startGame}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            {t('brainSummit.reset')}
          </Button>
        ) : undefined
      }
    >
      {!game ? (
        <div className="flex min-h-[28rem] flex-col items-center justify-center px-4 py-10 text-center">
          <span className="bg-navy text-sky flex size-20 items-center justify-center rounded-3xl shadow-soft">
            <MountainSnow className="size-9" aria-hidden="true" />
          </span>
          <h2 className="text-navy mt-6 text-2xl font-extrabold tracking-[-0.03em]">
            {t('brainSummit.readyTitle')}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md text-sm leading-6">
            {t('brainSummit.readyDescription')}
          </p>
          <Button type="button" size="lg" className="mt-7" onClick={startGame}>
            {t('brainSummit.start')}
          </Button>
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

          <div className="border-border mt-6 rounded-2xl border p-4 sm:p-6">
            <div className="text-navy flex items-start gap-3">
              <CircleHelp
                className="mt-0.5 size-5 shrink-0 text-sky"
                aria-hidden="true"
              />
              <h2
                id="brain-summit-question"
                className="text-lg leading-7 font-extrabold sm:text-xl"
              >
                {t(`brainSummit.questions.${question.id}.prompt`)}
              </h2>
            </div>

            <div
              className="mt-5 grid gap-3 sm:grid-cols-2"
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
                    className={`focus-visible:ring-navy/35 flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold outline-none transition-[background-color,border-color,box-shadow,transform] duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none ${
                      revealCorrect
                        ? 'border-sage bg-sage/10 text-sage-dark'
                        : revealIncorrect
                          ? 'border-crimson bg-crimson/[0.07] text-crimson'
                          : 'border-border bg-card text-navy hover:-translate-y-0.5 hover:border-navy/35 hover:shadow-soft'
                    }`}
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
                      className={`flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${
                        revealCorrect
                          ? 'bg-sage text-white'
                          : revealIncorrect
                            ? 'bg-crimson text-white'
                            : 'bg-azure text-navy'
                      }`}
                      aria-hidden="true"
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="min-w-0 flex-1 leading-6">
                      {t(
                        `brainSummit.questions.${question.id}.options.${optionId}`
                      )}
                    </span>
                    {revealCorrect ? (
                      <CheckCircle2
                        className="size-5 shrink-0"
                        aria-hidden="true"
                      />
                    ) : null}
                    {revealIncorrect ? (
                      <XCircle
                        className="size-5 shrink-0"
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
              className={`mt-4 rounded-2xl border p-4 sm:p-5 ${
                selectedCorrect
                  ? 'border-sage/40 bg-sage/10'
                  : 'border-amber/45 bg-amber/10'
              }`}
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
                  <h3 className="text-navy text-sm font-extrabold">
                    {selectedCorrect
                      ? t('brainSummit.correct')
                      : t('brainSummit.incorrect')}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-6">
                    {t(
                      `brainSummit.questions.${question.id}.explanation`
                    )}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="lg"
                className="mt-4 w-full sm:w-auto"
                aria-describedby="brain-summit-feedback"
                onClick={() =>
                  setGame((current) =>
                    current ? advanceBrainSummit(current) : current
                  )
                }
              >
                {game.currentIndex === game.questions.length - 1
                  ? t('brainSummit.seeResults')
                  : t('brainSummit.next')}
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </GamePageShell>
  );
}
