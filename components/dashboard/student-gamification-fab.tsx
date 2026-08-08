'use client';

import { Target, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { DailyMissionManager } from '@/components/dashboard/gamification/daily-mission-manager';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLocalUser } from '@/hooks/use-local-user';

interface StudentGamificationFabProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function StudentGamificationFab({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: StudentGamificationFabProps) {
  const user = useLocalUser();
  const t = useTranslations('recoveryDashboard');
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = typeof controlledOpen === 'boolean';
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(value);
    } else {
      setInternalOpen(value);
    }
  };

  if (user.role !== 'user') return null;

  return (
    <>
      <Button
        type="button"
        size="lg"
        data-tour="tour-fab"
        className="fixed right-4 bottom-5 z-40 gap-2 rounded-full border border-sky/60 font-bold shadow-float sm:right-6 sm:bottom-6"
        onClick={() => setOpen(true)}
      >
        <Target className="size-4" />
        {t('fabTitle')}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-navy">
              <Target className="size-5" />
              {t('missionTitle')}
            </DialogTitle>
          </DialogHeader>
          <DailyMissionManager compact />
          <Button
            type="button"
            variant="ghost"
            className="sr-only"
            aria-label={t('fabClose')}
            onClick={() => setOpen(false)}
          >
            <X />
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
