'use client';

import { useSyncExternalStore } from 'react';
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
  const clientReady = useSyncExternalStore(
    subscribeToClientReady,
    () => true,
    () => false,
  );

  if (!clientReady || user.role !== 'user' || completed) return null;

  return (
    <Dialog
      open
      disablePointerDismissal
      onOpenChange={(nextOpen, eventDetails) => {
        if (!nextOpen) eventDetails.cancel();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="shadow-float max-h-[calc(100dvh-2rem)] w-full overflow-y-auto rounded-2xl p-0 sm:max-w-xl"
      >
        <DialogHeader className="border-border bg-azure/35 gap-0.5 border-b px-4 py-4 sm:px-5">
          <DialogTitle className="text-navy text-lg leading-tight font-bold">
            {t('checkInGateTitle')}
          </DialogTitle>
          <DialogDescription className="text-sm leading-snug">
            {t('checkInGateDescription')}
          </DialogDescription>
        </DialogHeader>

        <PrivateCheckIn showHeader={false} onSave={onSave} />

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
