'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Check, RotateCcw, Theater } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FadeSwap } from '@/components/common/fade-swap';
import { SCENARIOS, type Scenario } from '@/lib/recovery/scenario-catalog';

/**
 * "Latihan respons" — three fictional branching scenarios (a friend's invite,
 * a judol ad, a loan temptation). Each choice gets a reflective outcome: the
 * assertive script is affirmed, the risky one calmly explains the persuasion
 * hook and offers a retry, the delay tactic is validated with a nudge toward
 * the assertive script. Session-only state; nothing is scored or sent.
 */
export function ScenarioPractice() {
  const t = useTranslations('scenarioSim');
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [choiceIndex, setChoiceIndex] = useState<1 | 2 | 3 | null>(null);
  const [finished, setFinished] = useState(false);

  const scenario: Scenario = SCENARIOS[scenarioIndex];
  const choice = choiceIndex
    ? scenario.choices.find((candidate) => candidate.index === choiceIndex)
    : null;
  const isLastScenario = scenarioIndex === SCENARIOS.length - 1;

  const advance = () => {
    setChoiceIndex(null);
    if (isLastScenario) {
      setFinished(true);
    } else {
      setScenarioIndex(scenarioIndex + 1);
    }
  };

  const restart = () => {
    setScenarioIndex(0);
    setChoiceIndex(null);
    setFinished(false);
  };

  return (
    <section
      className="border-border bg-card shadow-soft rounded-2xl border p-4 sm:p-5"
      aria-labelledby="scenario-practice-title"
    >
      <div className="flex items-start gap-3">
        <span
          className="bg-navy text-sky flex size-10 shrink-0 items-center justify-center rounded-xl shadow-sm"
          aria-hidden="true"
        >
          <Theater className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-navy-light text-xs font-bold tracking-[0.1em] uppercase">
            {t('eyebrow')}
          </p>
          <h2
            id="scenario-practice-title"
            className="text-navy mt-1 text-lg font-bold"
          >
            {t('title')}
          </h2>
          <p className="text-muted-foreground mt-0.5 text-xs leading-5">
            {t('fictionalNote')}
          </p>
        </div>
      </div>

      <div className="mt-3 flex gap-1.5" aria-hidden="true">
        {SCENARIOS.map((item, index) => (
          <span
            key={item.id}
            className={`h-1.5 flex-1 rounded-full transition-colors ${finished || index < scenarioIndex ? 'bg-sage' : index === scenarioIndex ? 'bg-navy' : 'bg-muted'}`}
          />
        ))}
      </div>

      <FadeSwap
        swapKey={
          finished ? 'done' : `${scenario.id}-${choiceIndex ?? 'choose'}`
        }
      >
        {finished ? (
          <div className="mt-4 flex items-center gap-3">
            <Image
              src="/images/mascot/gami-celebrate.webp"
              alt=""
              width={64}
              height={64}
              className="size-14 shrink-0 object-contain"
            />
            <div>
              <p className="text-navy text-sm font-bold">{t('doneTitle')}</p>
              <p className="text-muted-foreground mt-0.5 text-xs leading-5">
                {t('doneBody')}
              </p>
              <button
                type="button"
                onClick={restart}
                className="text-navy hover:text-navy-light focus-visible:ring-navy/30 mt-1.5 inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg text-xs font-bold outline-none focus-visible:ring-2"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                {t('restart')}
              </button>
            </div>
          </div>
        ) : !choice ? (
          <div className="mt-4">
            <div className="bg-muted/45 border-border rounded-2xl rounded-bl-md border p-3.5">
              <p className="text-foreground text-sm leading-6 italic">
                {t(`${scenario.id}.intro`)}
              </p>
            </div>
            <p className="text-navy mt-3 text-sm font-bold">
              {t(`${scenario.id}.prompt`)}
            </p>
            <div className="mt-2.5 grid gap-2">
              {scenario.choices.map((candidate) => (
                <button
                  key={candidate.index}
                  type="button"
                  onClick={() => setChoiceIndex(candidate.index)}
                  className="border-navy/15 text-navy hover:bg-azure/40 focus-visible:ring-navy/30 min-h-11 cursor-pointer rounded-xl border px-3 py-2 text-left text-sm font-semibold outline-none focus-visible:ring-2"
                >
                  {t(`${scenario.id}.choice${candidate.index}`)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <p
              className={`flex items-center gap-1.5 text-sm font-bold ${choice.kind === 'assertive' ? 'text-sage-dark' : 'text-navy'}`}
            >
              {choice.kind === 'assertive' ? (
                <Check className="size-4 shrink-0" aria-hidden="true" />
              ) : null}
              {t(`outcomeLabel.${choice.kind}`)}
            </p>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              {t(`${scenario.id}.outcome${choice.index}`)}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {choice.kind === 'risky' ? (
                <button
                  type="button"
                  onClick={() => setChoiceIndex(null)}
                  className="text-navy hover:text-navy-light focus-visible:ring-navy/30 inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg text-sm font-bold outline-none focus-visible:ring-2"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  {t('retry')}
                </button>
              ) : null}
              <button
                type="button"
                onClick={advance}
                className="text-navy hover:text-navy-light focus-visible:ring-navy/30 inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg text-sm font-bold outline-none focus-visible:ring-2"
              >
                {isLastScenario ? t('finish') : t('next')}
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </FadeSwap>
    </section>
  );
}
