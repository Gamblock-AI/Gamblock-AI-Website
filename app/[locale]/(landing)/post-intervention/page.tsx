'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  LockKeyhole,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
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

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
            {/* Breathing exercise leads on mobile — it is the reason the
                student landed here. */}
            <section
              className="border-navy/15 shadow-soft overflow-hidden rounded-[1.75rem] border bg-white/85 backdrop-blur lg:order-2"
              aria-labelledby="grounding-title"
            >
              <div className="border-border border-b p-5">
                <h2
                  id="grounding-title"
                  className="text-navy text-xl font-bold"
                >
                  {t('groundingTitle')}
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {t('groundingDescription')}
                </p>
              </div>

              <div className="p-5 text-center">
                <motion.div
                  className={`border-navy/15 bg-azure/60 relative mx-auto flex size-40 items-center justify-center rounded-full border sm:size-48 ${
                    complete ? 'ring-sage/25 ring-4' : ''
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
                    width={112}
                    height={112}
                    className="animate-float-slow size-28 object-contain"
                    aria-hidden="true"
                  />
                  {complete ? (
                    <motion.span
                      className="bg-sage absolute right-1 bottom-1 flex size-10 items-center justify-center rounded-full text-white shadow-sm"
                      initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      aria-hidden="true"
                    >
                      <Check className="size-5" />
                    </motion.span>
                  ) : null}
                </motion.div>

                <div
                  className="mt-6 min-h-24"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <FadeSwap swapKey={swapKey}>
                    {complete ? (
                      <>
                        <p className="text-sage text-lg font-bold">
                          {t('completeTitle')}
                        </p>
                        <p className="text-muted-foreground mt-2 text-sm leading-6">
                          {t('completeBody')}
                        </p>
                      </>
                    ) : started ? (
                      <>
                        <p className="text-navy text-lg font-bold">
                          {t(currentPhase.key)}
                        </p>
                        <p className="text-navy mt-1 text-3xl font-extrabold tabular-nums">
                          {t('seconds', { count: remaining })}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs font-medium">
                          {t('round', { current: round, total: TOTAL_ROUNDS })}
                        </p>
                      </>
                    ) : (
                      <p className="text-navy pt-5 text-lg font-bold">
                        {t('phaseReady')}
                      </p>
                    )}
                  </FadeSwap>
                </div>

                <div
                  className="mt-3 flex items-center justify-center gap-2"
                  aria-hidden="true"
                >
                  {Array.from({ length: TOTAL_ROUNDS }, (_, index) => (
                    <span
                      key={index}
                      className={`size-2.5 rounded-full transition-colors duration-300 motion-reduce:transition-none ${
                        complete || round > index + (started ? 0 : 1)
                          ? 'bg-sage'
                          : started && round === index + 1
                            ? 'bg-navy/60'
                            : 'bg-navy/15'
                      }`}
                    />
                  ))}
                </div>

                <div className="mt-5 grid gap-2">
                  {!started ? (
                    <Button size="lg" className="h-12 w-full" onClick={start}>
                      <Play className="size-4" aria-hidden="true" />
                      {t('start')}
                    </Button>
                  ) : complete ? (
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-12 w-full"
                      onClick={reset}
                    >
                      <RotateCcw className="size-4" aria-hidden="true" />
                      {t('reset')}
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="lg"
                        className="h-12 w-full"
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
                        className="h-11 w-full"
                        onClick={reset}
                      >
                        <RotateCcw className="size-4" aria-hidden="true" />
                        {t('reset')}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </section>

            <section
              className="border-navy/15 bg-azure/45 shadow-soft rounded-[1.75rem] border p-5 backdrop-blur sm:p-8 lg:order-1"
              aria-labelledby="post-intervention-title"
            >
              <p className="text-sage text-xs font-bold tracking-[0.12em] uppercase">
                {t('eyebrow')}
              </p>
              <h1
                id="post-intervention-title"
                className="text-navy mt-3 max-w-2xl text-3xl leading-tight font-extrabold tracking-tight sm:text-5xl"
              >
                {t('title')}
              </h1>
              <p className="text-muted-foreground mt-4 max-w-2xl text-sm leading-7 sm:text-base">
                {t('description')}
              </p>

              <div className="border-sage/20 mt-7 flex items-start gap-3 rounded-2xl border bg-white/80 p-4">
                <LockKeyhole
                  className="text-sage mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="text-navy text-sm font-bold">
                    {t('privacyTitle')}
                  </h2>
                  <p className="text-muted-foreground mt-1 text-xs leading-5">
                    {t('privacyBody')}
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  nativeButton={false}
                  className="h-12"
                  render={<Link href={ROUTES.RECOVERY} />}
                >
                  {t('openRecovery')}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  nativeButton={false}
                  className="h-12"
                  render={<Link href={ROUTES.HELP} />}
                >
                  <CircleHelp className="size-4" aria-hidden="true" />
                  {t('openHelp')}
                </Button>
              </div>
            </section>
          </div>

          <section
            className="border-sage/20 bg-sage/[0.055] mt-6 rounded-[1.5rem] border p-5 backdrop-blur sm:p-6"
            aria-labelledby="post-support-title"
          >
            <div className="flex items-start gap-4">
              <CircleHelp
                className="text-sage mt-0.5 size-6 shrink-0"
                aria-hidden="true"
              />
              <div>
                <h2
                  id="post-support-title"
                  className="text-navy text-lg font-bold"
                >
                  {t('supportTitle')}
                </h2>
                <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-6">
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
