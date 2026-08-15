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
              className="border-navy/10 shadow-soft relative overflow-hidden rounded-[2rem] border bg-white/90 backdrop-blur-md lg:order-2"
              aria-labelledby="grounding-title"
            >
              <div
                className="pointer-events-none absolute -right-20 -bottom-20 size-72 rounded-full bg-gradient-to-tl from-sky/15 via-azure/30 to-transparent opacity-60 blur-2xl"
                aria-hidden="true"
              />
              <div className="border-border/80 border-b p-5 sm:p-6">
                <h2
                  id="grounding-title"
                  className="text-navy text-xl font-bold tracking-tight"
                >
                  {t('groundingTitle')}
                </h2>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                  {t('groundingDescription')}
                </p>
              </div>

              <div className="p-5 text-center sm:p-6">
                <motion.div
                  className={`relative mx-auto flex size-44 items-center justify-center rounded-full border border-sky/30 bg-gradient-to-b from-sky-light/40 via-azure/40 to-white shadow-inner sm:size-52 ${
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
                    className="animate-float-slow size-28 object-contain sm:size-32 drop-shadow-sm"
                    aria-hidden="true"
                  />
                  {complete ? (
                    <motion.span
                      className="bg-sage shadow-soft absolute right-1.5 bottom-1.5 flex size-10 items-center justify-center rounded-full text-white"
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
                        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                          {t('completeBody')}
                        </p>
                      </>
                    ) : started ? (
                      <>
                        <p className="text-navy text-lg font-bold">
                          {t(currentPhase.key)}
                        </p>
                        <p className="text-navy mt-1 text-3xl font-extrabold tracking-tight tabular-nums sm:text-4xl">
                          {t('seconds', { count: remaining })}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs font-semibold uppercase tracking-wider">
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
                      className={`h-2 rounded-full transition-all duration-300 motion-reduce:transition-none ${
                        complete || round > index + (started ? 0 : 1)
                          ? 'bg-sage w-6'
                          : started && round === index + 1
                            ? 'bg-navy w-6'
                            : 'bg-navy/15 w-2'
                      }`}
                    />
                  ))}
                </div>

                <div className="mt-6 grid gap-2.5">
                  {!started ? (
                    <Button size="lg" className="h-12 w-full font-semibold shadow-sm" onClick={start}>
                      <Play className="size-4" aria-hidden="true" />
                      {t('start')}
                    </Button>
                  ) : complete ? (
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-12 w-full font-semibold"
                      onClick={reset}
                    >
                      <RotateCcw className="size-4" aria-hidden="true" />
                      {t('reset')}
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="lg"
                        className="h-12 w-full font-semibold shadow-sm"
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
                        className="text-muted-foreground hover:text-navy h-10 w-full"
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
              className="border-navy/10 shadow-soft relative overflow-hidden rounded-[2rem] border bg-white/90 p-6 backdrop-blur-md sm:p-9 lg:order-1"
              aria-labelledby="post-intervention-title"
            >
              <div
                className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-gradient-to-br from-azure/60 via-sky-light/20 to-transparent opacity-70 blur-3xl"
                aria-hidden="true"
              />
              <div className="relative">
                <span className="border-sage/25 bg-sage/[0.08] text-sage inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wider uppercase">
                  {t('eyebrow')}
                </span>
                <h1
                  id="post-intervention-title"
                  className="text-navy mt-4 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]"
                >
                  {t('title')}
                </h1>
                <p className="text-muted-foreground mt-4 max-w-2xl text-sm leading-relaxed sm:text-base">
                  {t('description')}
                </p>

                <div className="border-sage/20 bg-sage/[0.04] mt-8 flex items-start gap-3.5 rounded-2xl border p-4 sm:p-5">
                  <div className="border-sage/20 bg-sage/10 text-sage flex size-9 shrink-0 items-center justify-center rounded-xl border">
                    <LockKeyhole className="size-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-navy text-sm font-bold">
                      {t('privacyTitle')}
                    </h2>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed sm:text-sm">
                      {t('privacyBody')}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    size="lg"
                    nativeButton={false}
                    className="h-12 px-6 font-semibold shadow-sm"
                    render={<Link href={ROUTES.RECOVERY} />}
                  >
                    {t('openRecovery')}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    nativeButton={false}
                    className="border-navy/15 text-navy hover:bg-navy/5 h-12 px-5 font-semibold"
                    render={<Link href={ROUTES.HELP} />}
                  >
                    <CircleHelp className="size-4" aria-hidden="true" />
                    {t('openHelp')}
                  </Button>
                </div>
              </div>
            </section>
          </div>

          <section
            className="border-navy/10 shadow-soft relative mt-6 overflow-hidden rounded-[1.75rem] border bg-white/90 p-6 backdrop-blur-md sm:p-7"
            aria-labelledby="post-support-title"
          >
            <div
              className="pointer-events-none absolute top-0 left-0 h-full w-1.5 bg-gradient-to-b from-sage to-sage-light"
              aria-hidden="true"
            />
            <div className="flex items-start gap-4">
              <div className="border-sage/20 bg-sage/10 text-sage flex size-11 shrink-0 items-center justify-center rounded-2xl border">
                <CircleHelp className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h2
                  id="post-support-title"
                  className="text-navy text-lg font-bold sm:text-xl"
                >
                  {t('supportTitle')}
                </h2>
                <p className="text-muted-foreground mt-1.5 max-w-3xl text-sm leading-relaxed sm:text-base">
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
