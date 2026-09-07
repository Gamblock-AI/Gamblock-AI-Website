'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CircleHelp,
  Droplets,
  Footprints,
  HeartPulse,
  MessageCircle,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';

const PAUSE_DURATION = 45;
const PHASE_DURATION = 15;

const triggerKeys = [
  'bored',
  'stressed',
  'restless',
  'curious',
  'escape',
  'unsure',
] as const;

const actionKeys = [
  'move',
  'water',
  'trustedPerson',
  'recovery',
  'education',
  'help',
] as const;

type TriggerKey = (typeof triggerKeys)[number];
type ActionKey = (typeof actionKeys)[number];
type Step =
  | 'intro'
  | 'initialRating'
  | 'trigger'
  | 'pause'
  | 'action'
  | 'finalRating'
  | 'complete';

const actionRoutes: Partial<Record<ActionKey, string>> = {
  recovery: ROUTES.RECOVERY,
  education: ROUTES.EDUCATION,
  help: ROUTES.HELP,
};

const actionIcons = {
  move: Footprints,
  water: Droplets,
  trustedPerson: MessageCircle,
  recovery: HeartPulse,
  education: BookOpen,
  help: CircleHelp,
} satisfies Record<ActionKey, typeof Footprints>;

const steps: Step[] = [
  'intro',
  'initialRating',
  'trigger',
  'pause',
  'action',
  'finalRating',
  'complete',
];

const ratingValues = Array.from({ length: 11 }, (_, index) => index);

export function PostInterventionPauseChoice() {
  const t = useTranslations('postIntervention');
  const reduce = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState<Step>('intro');
  const [initialRating, setInitialRating] = useState<number | null>(null);
  const [finalRating, setFinalRating] = useState<number | null>(null);
  const [trigger, setTrigger] = useState<TriggerKey | null>(null);
  const [action, setAction] = useState<ActionKey | null>(null);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(PAUSE_DURATION);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (step !== 'pause' || !running || remaining <= 0) return;

    const timer = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          setRunning(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [remaining, running, step]);

  const reset = () => {
    setStep('intro');
    setInitialRating(null);
    setFinalRating(null);
    setTrigger(null);
    setAction(null);
    setRunning(false);
    setRemaining(PAUSE_DURATION);
  };

  const goBack = () => {
    if (step === 'initialRating') setStep('intro');
    if (step === 'trigger') setStep('initialRating');
    if (step === 'pause') {
      setRunning(false);
      setRemaining(PAUSE_DURATION);
      setStep('trigger');
    }
    if (step === 'action') setStep('pause');
    if (step === 'finalRating') setStep('action');
  };

  const phaseIndex = Math.min(
    2,
    Math.floor((PAUSE_DURATION - remaining) / PHASE_DURATION)
  );
  const phaseKey =
    phaseIndex === 0
      ? 'pausePhaseNotice'
      : phaseIndex === 1
        ? 'pausePhaseName'
        : 'pausePhaseWait';
  const progress = ((PAUSE_DURATION - remaining) / PAUSE_DURATION) * 100;
  const isPauseComplete = remaining === 0;
  const currentStepIndex = steps.indexOf(step);
  const selectedActionRoute = action ? actionRoutes[action] : undefined;
  const SelectedActionIcon = action ? actionIcons[action] : null;

  return (
    <section
      className="border-border/80 bg-card shadow-card relative flex h-full flex-col justify-between overflow-hidden rounded-2xl sm:rounded-[2rem] border backdrop-blur-md order-2"
      aria-labelledby="pause-choice-title"
    >
      <div
        className="pointer-events-none absolute -right-20 -bottom-20 size-72 rounded-full bg-gradient-to-tl from-sky/15 via-azure/30 to-transparent opacity-60 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="border-border/60 border-b p-3.5 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id="pause-choice-title"
                ref={headingRef}
                tabIndex={-1}
                className="text-navy text-sm sm:text-base font-bold tracking-tight outline-none"
              >
                {t('pauseChoiceTitle')}
              </h2>
              <p className="text-muted-foreground mt-0.5 text-[11px] sm:text-xs leading-relaxed">
                {t('pauseChoiceDescription')}
              </p>
            </div>
            {step !== 'intro' && step !== 'complete' ? (
              <span className="text-muted-foreground shrink-0 text-[10px] font-semibold tabular-nums">
                {t('pauseChoiceStep', {
                  current: currentStepIndex,
                  total: steps.length - 2,
                })}
              </span>
            ) : null}
          </div>
        </div>

        <div className="p-3.5 sm:p-5">
          <div
            className="sr-only"
            aria-live="polite"
            aria-atomic="true"
          >
            {t('pauseChoiceCurrentStep', { step: currentStepIndex })}
          </div>

          {step === 'intro' ? (
            <div className="space-y-4">
              <div className="flex justify-center py-2">
                <motion.div
                  className="relative flex size-24 sm:size-28 items-center justify-center rounded-full border border-sky/30 bg-gradient-to-b from-sky-light/40 via-azure/40 to-white shadow-inner"
                  animate={reduce ? undefined : { scale: [1, 1.04, 1] }}
                  transition={
                    reduce
                      ? undefined
                      : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                  }
                >
                  <Image
                    src="/images/logo-mark.png"
                    alt=""
                    width={112}
                    height={94}
                    className="size-14 object-contain sm:size-16"
                    aria-hidden="true"
                  />
                </motion.div>
              </div>
              <div className="text-center">
                <h3 className="text-navy text-sm font-bold">
                  {t('pauseChoiceIntroTitle')}
                </h3>
                <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                  {t('pauseChoiceIntroBody')}
                </p>
              </div>
              <Button
                size="lg"
                className="h-10 w-full text-xs font-bold shadow-xs sm:h-11 sm:text-sm"
                onClick={() => setStep('initialRating')}
              >
                <Play className="size-4" aria-hidden="true" />
                {t('pauseChoiceStart')}
              </Button>
            </div>
          ) : null}

          {step === 'initialRating' ? (
            <StepPanel
              title={t('pauseChoiceInitialRatingTitle')}
              description={t('pauseChoiceInitialRatingDescription')}
              onBack={goBack}
              backLabel={t('pauseChoiceBack')}
            >
              <RatingPicker
                value={initialRating}
                onChange={setInitialRating}
                label={t('pauseChoiceRatingLabel')}
                lowLabel={t('pauseChoiceRatingLow')}
                highLabel={t('pauseChoiceRatingHigh')}
              />
              <Button
                size="lg"
                className="h-10 w-full text-xs font-bold sm:h-11 sm:text-sm"
                disabled={initialRating === null}
                onClick={() => setStep('trigger')}
              >
                {t('pauseChoiceContinue')}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </StepPanel>
          ) : null}

          {step === 'trigger' ? (
            <StepPanel
              title={t('pauseChoiceTriggerTitle')}
              description={t('pauseChoiceTriggerDescription')}
              onBack={goBack}
              backLabel={t('pauseChoiceBack')}
            >
              <div className="grid grid-cols-2 gap-2" role="listbox" aria-label={t('pauseChoiceTriggerTitle')}>
                {triggerKeys.map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="option"
                    aria-selected={trigger === key}
                    onClick={() => setTrigger(key)}
                    className={`border-border/80 text-navy hover:border-navy/30 hover:bg-azure/40 min-h-11 rounded-xl border px-2.5 py-2 text-left text-[11px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none sm:text-xs ${
                      trigger === key
                        ? 'border-navy bg-navy text-white hover:bg-navy'
                        : 'bg-background/60'
                    }`}
                  >
                    {t(`pauseChoiceTrigger.${key}`)}
                  </button>
                ))}
              </div>
              <Button
                size="lg"
                className="h-10 w-full text-xs font-bold sm:h-11 sm:text-sm"
                disabled={trigger === null}
                onClick={() => {
                  setRemaining(PAUSE_DURATION);
                  setRunning(false);
                  setStep('pause');
                }}
              >
                {t('pauseChoiceBeginPause')}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </StepPanel>
          ) : null}

          {step === 'pause' ? (
            <div className="space-y-4">
              <div className="flex justify-center py-1">
                <motion.div
                  className={`relative flex size-28 sm:size-32 items-center justify-center rounded-full border border-sky/30 bg-gradient-to-b from-sky-light/40 via-azure/40 to-white shadow-inner ${
                    isPauseComplete ? 'ring-sage/30 ring-4' : ''
                  }`}
                  animate={reduce ? undefined : { scale: running ? [1, 1.08, 1] : 1 }}
                  transition={
                    reduce || !running
                      ? undefined
                      : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                  }
                >
                  {isPauseComplete ? (
                    <Check className="text-sage size-9" aria-hidden="true" />
                  ) : (
                    <span className="text-navy text-2xl font-extrabold tabular-nums">
                      {remaining}
                    </span>
                  )}
                </motion.div>
              </div>

              <div
                className="text-center"
                aria-live="polite"
                aria-atomic="true"
              >
                <p className="text-navy text-xs font-bold sm:text-sm">
                  {isPauseComplete ? t('pauseChoicePauseComplete') : t(phaseKey)}
                </p>
                <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                  {isPauseComplete
                    ? t('pauseChoicePauseCompleteBody')
                    : t('pauseChoiceSeconds', { count: remaining })}
                </p>
              </div>

              <div
                className="bg-border/50 h-2 overflow-hidden rounded-full"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={PAUSE_DURATION}
                aria-valuenow={PAUSE_DURATION - remaining}
                aria-label={t('pauseChoiceProgressLabel')}
              >
                <div
                  className="bg-sage h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <ol
                className="relative grid grid-cols-3 gap-2 text-center"
                aria-label={t('pauseChoicePhaseProgressLabel')}
              >
                <span
                  className="bg-border/70 absolute top-3.5 right-[16%] left-[16%] h-px"
                  aria-hidden="true"
                />
                {[0, 1, 2].map((index) => (
                  <li
                    key={index}
                    aria-current={phaseIndex === index ? 'step' : undefined}
                    className={`relative z-10 flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors motion-reduce:transition-none ${
                      !isPauseComplete && phaseIndex === index
                        ? 'text-navy'
                        : isPauseComplete || phaseIndex > index
                          ? 'text-sage'
                          : 'text-muted-foreground'
                    }`}
                  >
                    <span
                      className={`flex size-7 items-center justify-center rounded-full border bg-card text-[10px] font-bold shadow-2xs ${
                        !isPauseComplete && phaseIndex === index
                          ? 'border-navy bg-navy text-white'
                          : isPauseComplete || phaseIndex > index
                            ? 'border-sage bg-sage text-white'
                            : 'border-border/80 text-muted-foreground'
                      }`}
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <span>
                      {t(
                        index === 0
                          ? 'pauseChoicePhaseNotice'
                          : index === 1
                            ? 'pauseChoicePhaseName'
                            : 'pauseChoicePhaseWait'
                      )}
                    </span>
                  </li>
                ))}
              </ol>

              {isPauseComplete ? (
                <Button
                  size="lg"
                  className="h-10 w-full text-xs font-bold sm:h-11 sm:text-sm"
                  onClick={() => setStep('action')}
                >
                  {t('pauseChoiceChooseAction')}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              ) : (
                <div className="grid gap-1.5">
                  <Button
                    size="lg"
                    className="h-10 w-full text-xs font-bold shadow-xs sm:h-11 sm:text-sm"
                    onClick={() => setRunning((current) => !current)}
                  >
                    {running ? (
                      <Pause className="size-4" aria-hidden="true" />
                    ) : (
                      <Play className="size-4" aria-hidden="true" />
                    )}
                    {running ? t('pauseChoicePause') : t('pauseChoiceResume')}
                  </Button>
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      className="h-8 px-2 text-[11px] font-semibold text-muted-foreground hover:text-navy"
                      onClick={goBack}
                    >
                      <ArrowLeft className="size-3.5" aria-hidden="true" />
                      {t('pauseChoiceBack')}
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-8 px-2 text-[11px] font-semibold text-muted-foreground hover:text-navy"
                      onClick={reset}
                    >
                      <RotateCcw className="size-3.5" aria-hidden="true" />
                      {t('pauseChoiceRestart')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {step === 'action' ? (
            <StepPanel
              title={t('pauseChoiceActionTitle')}
              description={t('pauseChoiceActionDescription')}
              onBack={goBack}
              backLabel={t('pauseChoiceBack')}
            >
              <div className="grid gap-2" role="listbox" aria-label={t('pauseChoiceActionTitle')}>
                {actionKeys.map((key) => {
                  const Icon = actionIcons[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      role="option"
                      aria-selected={action === key}
                      onClick={() => setAction(key)}
                      className={`border-border/80 flex min-h-11 items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none ${
                        action === key
                          ? 'border-navy bg-navy text-white'
                          : 'bg-background/60 text-navy hover:border-navy/30 hover:bg-azure/40'
                      }`}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden="true" />
                      <span className="text-[11px] font-semibold sm:text-xs">
                        {t(`pauseChoiceAction.${key}`)}
                      </span>
                    </button>
                  );
                })}
              </div>
              <Button
                size="lg"
                className="h-10 w-full text-xs font-bold sm:h-11 sm:text-sm"
                disabled={action === null}
                onClick={() => setStep('finalRating')}
              >
                {t('pauseChoiceRateAgain')}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </StepPanel>
          ) : null}

          {step === 'finalRating' ? (
            <StepPanel
              title={t('pauseChoiceFinalRatingTitle')}
              description={t('pauseChoiceFinalRatingDescription')}
              onBack={goBack}
              backLabel={t('pauseChoiceBack')}
            >
              <RatingPicker
                value={finalRating}
                onChange={setFinalRating}
                label={t('pauseChoiceRatingLabel')}
                lowLabel={t('pauseChoiceRatingLow')}
                highLabel={t('pauseChoiceRatingHigh')}
              />
              <Button
                size="lg"
                className="h-10 w-full text-xs font-bold sm:h-11 sm:text-sm"
                disabled={finalRating === null}
                onClick={() => setStep('complete')}
              >
                {t('pauseChoiceFinish')}
                <Check className="size-4" aria-hidden="true" />
              </Button>
            </StepPanel>
          ) : null}

          {step === 'complete' && action ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="bg-sage/10 text-sage flex size-14 items-center justify-center rounded-full">
                  <Check className="size-7" aria-hidden="true" />
                </div>
              </div>
              <div>
                <h3 className="text-sage text-sm font-bold sm:text-base">
                  {t('pauseChoiceCompleteTitle')}
                </h3>
                <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                  {t('pauseChoiceCompleteBody', {
                    initial: initialRating ?? 0,
                    final: finalRating ?? 0,
                  })}
                </p>
              </div>
              <div className="border-border/80 bg-background/60 flex items-center gap-2 rounded-xl border p-3 text-left">
                {SelectedActionIcon ? (
                  <SelectedActionIcon className="text-navy size-4 shrink-0" aria-hidden="true" />
                ) : null}
                <span className="text-navy text-[11px] font-semibold sm:text-xs">
                  {t(`pauseChoiceAction.${action}`)}
                </span>
              </div>
              {selectedActionRoute ? (
                <Button
                  size="lg"
                  nativeButton={false}
                  className="h-10 w-full text-xs font-bold sm:h-11 sm:text-sm"
                  render={<Link href={selectedActionRoute} />}
                >
                  {t('pauseChoiceOpenSelected')}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              ) : null}
              <Button
                variant="ghost"
                className="h-8 w-full text-[11px] font-semibold text-muted-foreground hover:text-navy"
                onClick={reset}
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                {t('pauseChoiceRestart')}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-border/60 bg-muted/20 border-t p-3 sm:p-4">
        <div className="text-navy text-xs font-bold">
          <span>{t('pauseChoiceHowTitle')}</span>
        </div>
        <div className="mt-1.5 grid gap-1.5 text-[11px] text-muted-foreground sm:text-xs">
          {[1, 2, 3].map((index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="bg-sage size-1.5 shrink-0 rounded-full" />
              <span>{t(`pauseChoiceHow${index}`)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepPanel({
  title,
  description,
  onBack,
  backLabel,
  children,
}: {
  title: string;
  description: string;
  onBack: () => void;
  backLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-navy text-sm font-bold sm:text-base">{title}</h3>
        <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed sm:text-xs">
          {description}
        </p>
      </div>
      {children}
      <Button
        variant="ghost"
        className="h-8 px-2 text-[11px] font-semibold text-muted-foreground hover:text-navy"
        onClick={onBack}
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        {backLabel}
      </Button>
    </div>
  );
}

function RatingPicker({
  value,
  onChange,
  label,
  lowLabel,
  highLabel,
}: {
  value: number | null;
  onChange: (value: number) => void;
  label: string;
  lowLabel: string;
  highLabel: string;
}) {
  return (
    <div className="space-y-2" role="group" aria-label={label}>
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-11">
        {ratingValues.map((rating) => (
          <button
            key={rating}
            type="button"
            aria-label={`${label}: ${rating}`}
            aria-pressed={value === rating}
            onClick={() => onChange(rating)}
            className={`min-h-10 rounded-lg border text-xs font-bold tabular-nums transition-colors focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none sm:min-h-11 ${
              value === rating
                ? 'border-navy bg-navy text-white'
                : 'border-border/80 bg-background/60 text-navy hover:border-navy/30 hover:bg-azure/40'
            }`}
          >
            {rating}
          </button>
        ))}
      </div>
      <div className="text-muted-foreground flex justify-between gap-3 text-[10px]">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
