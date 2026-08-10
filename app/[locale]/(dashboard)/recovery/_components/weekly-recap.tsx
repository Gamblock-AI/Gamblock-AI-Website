'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, LockKeyhole, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FadeSwap } from '@/components/common/fade-swap';
import { useProgressSnapshot } from '@/hooks/use-progress-snapshot';

type RecapCard =
  | { kind: 'checkIns'; value: number }
  | { kind: 'activeDays'; value: number }
  | { kind: 'learningHub'; value: number }
  | { kind: 'missions'; value: number }
  | { kind: 'closing'; tone: 'recapStrong' | 'recapSteady' | 'recapGentle' };

/**
 * "Cerita minggumu" — a private, calm recap card stack built from the 7-day
 * snapshot the page already has access to. Opens after a weekly review is
 * saved and from a quiet standalone button. Presence-framed thresholds, never
 * punitive, never shared.
 */
export function WeeklyRecap({ onClose }: { onClose: () => void }) {
  const t = useTranslations('weeklyRecap');
  const reduce = useReducedMotion();
  const snapshot = useProgressSnapshot(7);
  const [step, setStep] = useState(0);

  const data = snapshot.data;
  const cards: RecapCard[] = data
    ? [
        { kind: 'checkIns', value: data.check_in_count },
        { kind: 'activeDays', value: data.active_days },
        {
          kind: 'learningHub',
          value: data.activity_days.reduce(
            (total, day) => total + day.learning_hub,
            0
          ),
        },
        {
          kind: 'missions',
          value: data.activity_days.reduce((total, day) => total + day.missions, 0),
        },
        {
          kind: 'closing',
          tone:
            data.active_days >= 5
              ? 'recapStrong'
              : data.active_days >= 2
                ? 'recapSteady'
                : 'recapGentle',
        },
      ]
    : [];
  const card = cards[step];
  const isLast = step === cards.length - 1;

  return (
    <Dialog open onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogPortal>
        <DialogOverlay className="bg-navy/55 z-[80] backdrop-blur-sm" />
        <DialogPrimitive.Viewport className="fixed inset-0 z-[80] flex items-end justify-center overflow-y-auto overscroll-contain pt-[max(0.75rem,env(safe-area-inset-top))] md:items-center md:p-6">
          <DialogPrimitive.Popup
            render={
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduce ? 0 : 0.2 }}
              />
            }
            className="ring-foreground/10 bg-card relative flex w-full flex-col overflow-hidden rounded-t-[2rem] shadow-2xl ring-1 outline-none md:w-[26rem] md:rounded-[2rem]"
          >
            <DialogHeader className="border-border relative shrink-0 border-b p-5 pr-14 text-left">
              <p className="text-navy-light text-xs font-bold tracking-[0.14em] uppercase">
                {t('eyebrow')}
              </p>
              <DialogTitle className="text-navy mt-1 text-xl font-bold">
                {t('title')}
              </DialogTitle>
              <DialogDescription className="mt-0.5 flex items-center gap-1.5 text-xs">
                <LockKeyhole className="size-3 shrink-0" aria-hidden="true" />
                {t('privacyNote')}
              </DialogDescription>
              <DialogClose
                className="border-border text-muted-foreground hover:bg-muted hover:text-navy focus-visible:ring-navy/30 absolute top-5 right-5 flex size-10 cursor-pointer items-center justify-center rounded-full border transition-colors outline-none focus-visible:ring-2"
                aria-label={t('close')}
              >
                <X className="size-4" aria-hidden="true" />
              </DialogClose>
            </DialogHeader>
            <div className="p-5">
              {snapshot.loading || !card ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  {t('loading')}
                </p>
              ) : (
                <>
                  <FadeSwap swapKey={step}>
                    {card.kind === 'closing' ? (
                      <div className="flex items-center gap-3 py-2">
                        <Image
                          src="/images/mascot/gami-celebrate.webp"
                          alt=""
                          width={72}
                          height={72}
                          className="size-16 shrink-0 object-contain"
                        />
                        <p className="text-navy text-sm leading-6 font-semibold">
                          {t(card.tone)}
                        </p>
                      </div>
                    ) : (
                      <div className="py-2 text-center">
                        <p className="text-navy text-4xl font-extrabold tabular-nums">
                          {card.value}
                        </p>
                        <p className="text-muted-foreground mt-1 text-sm leading-6">
                          {t(`card.${card.kind}`, { count: card.value })}
                        </p>
                      </div>
                    )}
                  </FadeSwap>
                  <div
                    className="mt-4 flex justify-center gap-1.5"
                    aria-hidden="true"
                  >
                    {cards.map((_, index) => (
                      <span
                        key={index}
                        className={`size-1.5 rounded-full transition-colors ${index === step ? 'bg-navy' : 'bg-border'}`}
                      />
                    ))}
                  </div>
                  <Button
                    className="mt-4 w-full"
                    onClick={() => (isLast ? onClose() : setStep(step + 1))}
                  >
                    {isLast ? t('close') : t('next')}
                    {!isLast ? (
                      <ArrowRight className="size-4" aria-hidden="true" />
                    ) : null}
                  </Button>
                </>
              )}
            </div>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Viewport>
      </DialogPortal>
    </Dialog>
  );
}
