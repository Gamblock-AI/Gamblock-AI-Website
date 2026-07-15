'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  CircleHelp,
  LockKeyhole,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';

const TOTAL_ROUNDS = 3;
const phases = [
  { key: 'phaseInhale', duration: 4 },
  { key: 'phaseHold', duration: 2 },
  { key: 'phaseExhale', duration: 6 },
] as const;

export default function PostInterventionPage() {
  const t = useTranslations('postIntervention');
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

  return (
    <main className="min-h-dvh bg-background px-5 py-6 sm:px-7 sm:py-10">
      <div className="mx-auto w-full max-w-5xl">
        <nav className="flex items-center justify-between gap-4" aria-label={t('leave')}>
          <Link
            href={ROUTES.HOME}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-semibold text-navy outline-none hover:underline focus-visible:ring-2 focus-visible:ring-navy/30"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {t('leave')}
          </Link>
          <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-sage/25 bg-sage/[0.06] px-3 text-xs font-semibold text-sage">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Gamblock-AI
          </span>
        </nav>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <section className="rounded-[1.75rem] border border-navy/15 bg-azure/45 p-5 shadow-soft sm:p-8" aria-labelledby="post-intervention-title">
            <p className="text-xs font-bold tracking-[0.12em] text-sage uppercase">{t('eyebrow')}</p>
            <h1 id="post-intervention-title" className="mt-3 max-w-2xl text-3xl leading-tight font-extrabold tracking-tight text-navy sm:text-5xl">
              {t('title')}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              {t('description')}
            </p>

            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-sage/20 bg-white/80 p-4">
              <LockKeyhole className="mt-0.5 size-5 shrink-0 text-sage" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-bold text-navy">{t('privacyTitle')}</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{t('privacyBody')}</p>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="h-12" render={<Link href={ROUTES.RECOVERY} />}>
                {t('openRecovery')}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
              <Button variant="outline" size="lg" className="h-12" render={<Link href={ROUTES.HELP} />}>
                <CircleHelp className="size-4" aria-hidden="true" />
                {t('openHelp')}
              </Button>
            </div>
          </section>

          <Card className="overflow-hidden" aria-labelledby="grounding-title">
            <div className="border-b border-border p-5">
              <h2 id="grounding-title" className="text-xl font-bold text-navy">{t('groundingTitle')}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('groundingDescription')}</p>
            </div>

            <div className="p-5 text-center">
              <div className="relative mx-auto flex size-40 items-center justify-center rounded-full border border-navy/15 bg-azure/60 sm:size-48">
                <Image
                  src="/images/mascot/gami-meditate.png"
                  alt=""
                  width={112}
                  height={112}
                  className="size-28 object-contain"
                  aria-hidden="true"
                />
              </div>

              <div className="mt-5 min-h-20" aria-live="polite" aria-atomic="true">
                {complete ? (
                  <>
                    <p className="text-lg font-bold text-sage">{t('completeTitle')}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('completeBody')}</p>
                  </>
                ) : started ? (
                  <>
                    <p className="text-lg font-bold text-navy">{t(currentPhase.key)}</p>
                    <p className="mt-1 text-3xl font-extrabold tabular-nums text-navy">
                      {t('seconds', { count: remaining })}
                    </p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      {t('round', { current: round, total: TOTAL_ROUNDS })}
                    </p>
                  </>
                ) : (
                  <p className="pt-5 text-lg font-bold text-navy">{t('phaseReady')}</p>
                )}
              </div>

              <div className="mt-5 grid gap-2">
                {!started ? (
                  <Button size="lg" className="h-12 w-full" onClick={start}>
                    <Play className="size-4" aria-hidden="true" />
                    {t('start')}
                  </Button>
                ) : complete ? (
                  <Button size="lg" variant="outline" className="h-12 w-full" onClick={reset}>
                    <RotateCcw className="size-4" aria-hidden="true" />
                    {t('reset')}
                  </Button>
                ) : (
                  <>
                    <Button size="lg" className="h-12 w-full" onClick={() => setRunning((current) => !current)}>
                      {running ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
                      {running ? t('pause') : t('resume')}
                    </Button>
                    <Button variant="ghost" className="h-11 w-full" onClick={reset}>
                      <RotateCcw className="size-4" aria-hidden="true" />
                      {t('reset')}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>

        <section className="mt-6 rounded-[1.5rem] border border-sage/20 bg-sage/[0.055] p-5 sm:p-6" aria-labelledby="post-support-title">
          <div className="flex items-start gap-4">
            <CircleHelp className="mt-0.5 size-6 shrink-0 text-sage" aria-hidden="true" />
            <div>
              <h2 id="post-support-title" className="text-lg font-bold text-navy">{t('supportTitle')}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('supportBody')}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
