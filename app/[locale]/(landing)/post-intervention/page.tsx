'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CircleHelp,
  HeartPulse,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { FadeSwap } from '@/components/common/fade-swap';
import { FixedBackground } from '@/components/landing/FixedBackground';
import { SkipLink } from '@/components/landing/SkipLink';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';

const TOTAL_ROUNDS = 3;
const phases = [
  { key: 'phaseInhale', duration: 4, scale: 1.18 },
  { key: 'phaseHold', duration: 2, scale: 1.18 },
  { key: 'phaseExhale', duration: 6, scale: 1 },
] as const;

export default function PostInterventionPage() {
  const t = useTranslations('postIntervention');
  const reduce = useReducedMotion();
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [complete, setComplete] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [remaining, setRemaining] = useState<number>(phases[0].duration);
  const [round, setRound] = useState(1);

  useEffect(() => {
    if (!running || complete) return;

    const timer = window.setInterval(() => {
      setRemaining((current) => {
        if (current > 1) return current - 1;

        const lastPhase = phaseIndex === phases.length - 1;
        if (!lastPhase) {
          const nextPhase = phaseIndex + 1;
          setPhaseIndex(nextPhase);
          return phases[nextPhase].duration;
        }

        if (round < TOTAL_ROUNDS) {
          setRound((currentRound) => currentRound + 1);
          setPhaseIndex(0);
          return phases[0].duration;
        }

        setRunning(false);
        setComplete(true);
        return 0;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [complete, phaseIndex, round, running]);

  const start = () => {
    setStarted(true);
    setComplete(false);
    setRunning(true);
  };

  const reset = () => {
    setRunning(false);
    setStarted(false);
    setComplete(false);
    setPhaseIndex(0);
    setRemaining(phases[0].duration);
    setRound(1);
  };

  const currentPhase = phases[phaseIndex];
  const breathScale =
    reduce || !started || complete ? 1 : currentPhase.scale;
  const swapKey = complete
    ? 'done'
    : started
      ? `${round}-${phaseIndex}`
      : 'ready';

  return (
    <>
      <SkipLink />
      <FixedBackground />
      <main
        id="main-content"
        className="min-h-dvh px-5 py-6 sm:px-7 sm:py-10"
      >
        <div className="mx-auto w-full max-w-5xl">
          <nav
            className="flex items-center justify-between gap-4"
            aria-label={t('leave')}
          >
            <Link
              href={ROUTES.HOME}
              className="text-navy focus-visible:ring-navy/30 inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-semibold outline-none hover:underline focus-visible:ring-2"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {t('leave')}
            </Link>
            <span className="border-sage/25 bg-sage/[0.06] text-sage inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-xs font-semibold">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Gamblock-AI
            </span>
          </nav>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-[1.1fr_0.9fr] items-stretch">
            {/* Left Card: Recovery Space & Next Steps */}
            <section
              className="border-border/80 bg-card shadow-card relative flex h-full flex-col justify-between overflow-hidden rounded-[2rem] border p-6 backdrop-blur-md sm:p-7 order-2 md:order-1"
              aria-labelledby="post-intervention-title"
            >
              <div
                className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-gradient-to-br from-azure/60 via-sky-light/20 to-transparent opacity-70 blur-3xl"
                aria-hidden="true"
              />
              <div className="relative">
                <h1
                  id="post-intervention-title"
                  className="text-navy max-w-2xl text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-[2.25rem] lg:leading-[1.2]"
                >
                  {t('title')}
                </h1>
                <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-relaxed sm:text-base">
                  {t('description')}
                </p>

                {/* Pathway Choice Cards */}
                <div className="mt-5 space-y-2">
                  <span className="text-xs font-bold text-navy uppercase tracking-wider">
                    {t('optionsTitle')}
                  </span>
                  <div className="grid gap-2">
                    <Link
                      href={ROUTES.RECOVERY}
                      className="group border-border/80 bg-background/50 hover:bg-azure/40 hover:border-navy/20 flex items-center justify-between rounded-xl border p-2.5 sm:p-3 transition-all duration-150"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="border-border/80 bg-card text-navy group-hover:bg-navy group-hover:text-white flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-lg border transition-colors shadow-2xs">
                          <HeartPulse className="size-4 sm:size-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-navy truncate sm:text-sm">
                            {t('optionRecoveryTitle')}
                          </p>
                          <p className="text-muted-foreground text-[11px] truncate sm:text-xs">
                            {t('optionRecoveryDesc')}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="text-muted-foreground group-hover:text-navy group-hover:translate-x-0.5 size-4 shrink-0 transition-transform" />
                    </Link>

                    <Link
                      href={ROUTES.EDUCATION}
                      className="group border-border/80 bg-background/50 hover:bg-azure/40 hover:border-navy/20 flex items-center justify-between rounded-xl border p-2.5 sm:p-3 transition-all duration-150"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="border-border/80 bg-card text-navy group-hover:bg-navy group-hover:text-white flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-lg border transition-colors shadow-2xs">
                          <BookOpen className="size-4 sm:size-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-navy truncate sm:text-sm">
                            {t('optionEducationTitle')}
                          </p>
                          <p className="text-muted-foreground text-[11px] truncate sm:text-xs">
                            {t('optionEducationDesc')}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="text-muted-foreground group-hover:text-navy group-hover:translate-x-0.5 size-4 shrink-0 transition-transform" />
                    </Link>

                    <Link
                      href={ROUTES.HELP}
                      className="group border-border/80 bg-background/50 hover:bg-azure/40 hover:border-navy/20 flex items-center justify-between rounded-xl border p-2.5 sm:p-3 transition-all duration-150"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="border-border/80 bg-card text-navy group-hover:bg-navy group-hover:text-white flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-lg border transition-colors shadow-2xs">
                          <CircleHelp className="size-4 sm:size-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-navy truncate sm:text-sm">
                            {t('optionHelpTitle')}
                          </p>
                          <p className="text-muted-foreground text-[11px] truncate sm:text-xs">
                            {t('optionHelpDesc')}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="text-muted-foreground group-hover:text-navy group-hover:translate-x-0.5 size-4 shrink-0 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                  <Button
                    size="lg"
                    nativeButton={false}
                    className="h-11 px-5 font-bold shadow-xs"
                    render={<Link href={ROUTES.RECOVERY} />}
                  >
                    {t('openRecovery')}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    nativeButton={false}
                    className="border-border hover:border-navy/20 hover:bg-azure/40 text-navy h-11 px-4 font-bold"
                    render={<Link href={ROUTES.HELP} />}
                  >
                    <CircleHelp className="size-4" aria-hidden="true" />
                    {t('openHelp')}
                  </Button>
                </div>
              </div>
            </section>

            {/* Right Card: Breathing Exercise & Grounding Hub */}
            <section
              className="border-border/80 bg-card shadow-card relative flex h-full flex-col justify-between overflow-hidden rounded-[2rem] border backdrop-blur-md order-1 md:order-2"
              aria-labelledby="grounding-title"
            >
              <div
                className="pointer-events-none absolute -right-20 -bottom-20 size-72 rounded-full bg-gradient-to-tl from-sky/15 via-azure/30 to-transparent opacity-60 blur-2xl"
                aria-hidden="true"
              />
              <div>
                <div className="border-border/60 border-b p-4 sm:p-5">
                  <h2
                    id="grounding-title"
                    className="text-navy text-base font-bold tracking-tight sm:text-lg"
                  >
                    {t('groundingTitle')}
                  </h2>
                  <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                    {t('groundingDescription')}
                  </p>
                </div>

                <div className="p-4 sm:p-5 space-y-3">
                  {/* Breathing Circle Arena */}
                  <div className="flex justify-center">
                    <motion.div
                      className={`relative flex size-28 sm:size-32 aspect-square shrink-0 items-center justify-center rounded-full border border-sky/30 bg-gradient-to-b from-sky-light/40 via-azure/40 to-white shadow-inner ${
                        complete ? 'ring-sage/30 ring-4' : ''
                      }`}
                      animate={{ scale: breathScale }}
                      transition={{
                        duration: reduce ? 0 : running ? currentPhase.duration : 0.4,
                        ease: 'easeInOut',
                      }}
                    >
                      <Image
                        src="/images/mascot/gami-meditate.webp"
                        alt=""
                        width={120}
                        height={120}
                        className="animate-float-slow size-16 object-contain sm:size-18 drop-shadow-sm"
                        aria-hidden="true"
                      />
                      {complete ? (
                        <motion.span
                          className="bg-sage shadow-soft absolute right-1 bottom-1 flex size-7 items-center justify-center rounded-full text-white"
                          initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          aria-hidden="true"
                        >
                          <Check className="size-3.5" />
                        </motion.span>
                      ) : null}
                    </motion.div>
                  </div>

                  {/* Status & Timer */}
                  <div
                    className="flex min-h-[3rem] flex-col items-center justify-center text-center"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <FadeSwap swapKey={swapKey}>
                      {complete ? (
                        <div>
                          <p className="text-sage text-sm font-bold sm:text-base">
                            {t('completeTitle')}
                          </p>
                          <p className="text-muted-foreground text-[11px] leading-relaxed sm:text-xs">
                            {t('completeBody')}
                          </p>
                        </div>
                      ) : started ? (
                        <div>
                          <p className="text-navy text-xs font-bold sm:text-sm">
                            {t(currentPhase.key)}
                          </p>
                          <p className="text-navy font-extrabold tracking-tight tabular-nums text-xl sm:text-2xl">
                            {t('seconds', { count: remaining })}
                          </p>
                          <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
                            {t('round', { current: round, total: TOTAL_ROUNDS })}
                          </p>
                        </div>
                      ) : (
                        <p className="text-navy text-sm font-bold sm:text-base">
                          {t('phaseReady')}
                        </p>
                      )}
                    </FadeSwap>
                  </div>

                  {/* 3-Phase Timing Pills with live active highlight */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                    <div
                      className={`rounded-lg border py-1.5 px-1 transition-all duration-200 ${
                        started && !complete && phaseIndex === 0
                          ? 'border-navy bg-navy text-white shadow-xs font-bold'
                          : 'border-border/70 bg-background/50 text-muted-foreground'
                      }`}
                    >
                      <span className="block text-[9px] font-semibold uppercase opacity-75">
                        {t('phasePillInhale')}
                      </span>
                      <span className="text-[11px] font-bold">4 dtk</span>
                    </div>
                    <div
                      className={`rounded-lg border py-1.5 px-1 transition-all duration-200 ${
                        started && !complete && phaseIndex === 1
                          ? 'border-navy bg-navy text-white shadow-xs font-bold'
                          : 'border-border/70 bg-background/50 text-muted-foreground'
                      }`}
                    >
                      <span className="block text-[9px] font-semibold uppercase opacity-75">
                        {t('phasePillHold')}
                      </span>
                      <span className="text-[11px] font-bold">2 dtk</span>
                    </div>
                    <div
                      className={`rounded-lg border py-1.5 px-1 transition-all duration-200 ${
                        started && !complete && phaseIndex === 2
                          ? 'border-navy bg-navy text-white shadow-xs font-bold'
                          : 'border-border/70 bg-background/50 text-muted-foreground'
                      }`}
                    >
                      <span className="block text-[9px] font-semibold uppercase opacity-75">
                        {t('phasePillExhale')}
                      </span>
                      <span className="text-[11px] font-bold">6 dtk</span>
                    </div>
                  </div>

                  {/* Round Progress Indicator */}
                  <div
                    className="flex items-center justify-center gap-1.5"
                    aria-hidden="true"
                  >
                    {Array.from({ length: TOTAL_ROUNDS }, (_, index) => (
                      <span
                        key={index}
                        className={`h-1 rounded-full transition-all duration-300 motion-reduce:transition-none ${
                          complete || round > index + (started ? 0 : 1)
                            ? 'bg-sage w-5'
                            : started && round === index + 1
                              ? 'bg-navy w-5'
                              : 'bg-navy/15 w-1.5'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Controls */}
                  <div className="grid gap-1.5">
                    {!started ? (
                      <Button size="lg" className="h-10 w-full font-bold shadow-xs" onClick={start}>
                        <Play className="size-4" aria-hidden="true" />
                        {t('start')}
                      </Button>
                    ) : complete ? (
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-10 w-full font-bold"
                        onClick={reset}
                      >
                        <RotateCcw className="size-4" aria-hidden="true" />
                        {t('reset')}
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="lg"
                          className="h-10 w-full font-bold shadow-xs"
                          onClick={() => setRunning((current) => !current)}
                        >
                          {running ? (
                            <Pause className="size-4" aria-hidden="true" />
                          ) : (
                            <Play className="size-4" aria-hidden="true" />
                          )}
                          {running ? t('pause') : t('resume')}
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-muted-foreground hover:text-navy h-7 w-full text-xs font-semibold"
                          onClick={reset}
                        >
                          <RotateCcw className="size-3" aria-hidden="true" />
                          {t('reset')}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Grounding Insights & Benefits Section (Compact Inline List) */}
              <div className="border-border/60 bg-muted/20 border-t p-3.5 sm:p-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-navy mb-2">
                  <Sparkles className="size-3.5 text-navy/70" />
                  <span>{t('groundingTipsTitle')}</span>
                </div>
                <div className="space-y-1.5 text-[11px] sm:text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-sage shrink-0" />
                    <span>
                      <strong className="font-bold text-navy">{t('groundingBenefit1Title')}:</strong>{' '}
                      {t('groundingBenefit1Desc')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-sky-dark shrink-0" />
                    <span>
                      <strong className="font-bold text-navy">{t('groundingBenefit2Title')}:</strong>{' '}
                      {t('groundingBenefit2Desc')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-navy shrink-0" />
                    <span>
                      <strong className="font-bold text-navy">{t('groundingBenefit3Title')}:</strong>{' '}
                      {t('groundingBenefit3Desc')}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Bottom Card: Emergency Support Callout */}
          <section
            className="border-border/80 bg-card shadow-card relative mt-6 overflow-hidden rounded-[1.75rem] border p-6 backdrop-blur-md sm:p-7"
            aria-labelledby="post-support-title"
          >
            <div className="flex items-start gap-4">
              <div className="border-navy/10 bg-azure/60 text-navy flex size-11 shrink-0 items-center justify-center rounded-2xl border shadow-2xs">
                <CircleHelp className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h2
                  id="post-support-title"
                  className="text-navy text-base font-bold sm:text-lg"
                >
                  {t('supportTitle')}
                </h2>
                <p className="text-muted-foreground mt-1 max-w-3xl text-sm leading-relaxed sm:text-base">
                  {t('supportBody')}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
