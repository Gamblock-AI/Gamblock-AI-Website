'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, LockKeyhole } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GamiCard } from '@/components/dashboard/gami-card';
import { PrivateCheckIn } from '@/components/dashboard/today/private-check-in';
import { useLocalUser } from '@/hooks/use-local-user';
import type { DailyCheckIn, MoodLevel, UrgeLevel } from '@/lib/recovery/types';

interface StudentCheckInGateProps {
  completed: boolean;
  onSave: (
    input: { mood: MoodLevel; urge: UrgeLevel | null },
  ) => Promise<DailyCheckIn | null>;
}

const subscribeToClientReady = () => () => undefined;
const SUCCESS_DISMISS_MS = 1600;

export function StudentCheckInGate({
  completed,
  onSave,
}: StudentCheckInGateProps) {
  const t = useTranslations('recoveryDashboard');
  const user = useLocalUser();
  const reduce = useReducedMotion();
  const [justSaved, setJustSaved] = useState(false);
  const [open, setOpen] = useState(true);
  const dismissTimerRef = useRef<number | null>(null);
  const clientReady = useSyncExternalStore(
    subscribeToClientReady,
    () => true,
    () => false,
  );

  useEffect(
    () => () => {
      if (dismissTimerRef.current !== null) {
        window.clearTimeout(dismissTimerRef.current);
      }
    },
    [],
  );

  if (!clientReady || user.role !== 'user' || (completed && !justSaved)) {
    return null;
  }

  const handleSave = async (input: {
    mood: MoodLevel;
    urge: UrgeLevel | null;
  }) => {
    const saved = await onSave(input);
    if (saved) {
      setJustSaved(true);
      dismissTimerRef.current = window.setTimeout(
        () => setOpen(false),
        SUCCESS_DISMISS_MS,
      );
    }
    return saved;
  };

  return (
    <Dialog
      open={open}
      disablePointerDismissal
      onOpenChange={(nextOpen, eventDetails) => {
        if (!nextOpen && !justSaved) eventDetails.cancel();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="shadow-float max-h-[calc(100dvh-2rem)] w-full overflow-y-auto rounded-2xl p-0 sm:max-w-xl"
      >
        {justSaved ? (
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <motion.span
              className="bg-sage flex size-14 items-center justify-center rounded-full text-white shadow-sm"
              initial={reduce ? false : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden="true"
            >
              <Check className="size-7" />
            </motion.span>
            <div role="status" className="w-full">
              <GamiCard
                image="/images/mascot/gami-celebrate.webp"
                title={t('checkInSaved')}
                message={t('checkInGateSavedBody')}
              />
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="border-border bg-azure/35 border-b px-4 py-4 sm:px-5">
              <div className="flex items-center gap-3">
                <span
                  className="bg-sky-light/45 flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full"
                  aria-hidden="true"
                >
                  <Image
                    src="/images/mascot/gami-wave.webp"
                    alt=""
                    width={48}
                    height={48}
                    className="size-11 object-contain"
                  />
                </span>
                <div className="min-w-0">
                  <DialogTitle className="text-navy text-lg leading-tight font-bold">
                    {t('checkInGateTitle')}
                  </DialogTitle>
                  <DialogDescription className="mt-0.5 text-sm leading-snug">
                    {t('checkInGateDescription')}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <PrivateCheckIn showHeader={false} onSave={handleSave} />

            <p className="border-border bg-muted/35 text-muted-foreground flex items-center gap-2 border-t px-4 py-3 text-xs leading-5 sm:px-5">
              <LockKeyhole
                className="text-navy size-4 shrink-0"
                aria-hidden="true"
              />
              {t('checkInGateStorage')}
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
