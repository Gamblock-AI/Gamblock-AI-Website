'use client';

import { useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { LockKeyhole } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

export function StudentCheckInGate({
  completed,
  onSave,
}: StudentCheckInGateProps) {
  const t = useTranslations('recoveryDashboard');
  const user = useLocalUser();
  const [open, setOpen] = useState(true);
  const clientReady = useSyncExternalStore(
    subscribeToClientReady,
    () => true,
    () => false,
  );

  if (!clientReady || user.role !== 'user' || completed) {
    return null;
  }

  const handleSave = async (input: {
    mood: MoodLevel;
    urge: UrgeLevel | null;
  }) => {
    const saved = await onSave(input);
    if (saved) {
      setOpen(false);
    }
    return saved;
  };

  return (
    <Dialog
      open={open}
      disablePointerDismissal
      onOpenChange={(nextOpen, eventDetails) => {
        if (!nextOpen) eventDetails.cancel();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="shadow-float max-h-[calc(100dvh-2rem)] w-full overflow-y-auto rounded-2xl p-0 sm:max-w-xl"
      >
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
      </DialogContent>
    </Dialog>
  );
}

