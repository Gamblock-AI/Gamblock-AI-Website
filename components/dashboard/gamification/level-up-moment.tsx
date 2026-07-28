'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogContent,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { levelPoseAsset, LEVEL_REWARDS } from '@/lib/recovery/level-rewards';
import { getLevelTitleKey } from '@/lib/recovery/level-titles';

/**
 * Calm dedicated level-up moment: the tier's mascot pose, the new journey
 * title, and whatever the level unlocked. No confetti, no sound, no pressure —
 * a single continue action. Reduced motion renders everything statically.
 */
export function LevelUpMoment({
  level,
  newlyUnlocked,
  onClose,
}: {
  level: number;
  newlyUnlocked: string[];
  onClose: () => void;
}) {
  const t = useTranslations('recoveryDashboard');
  const room = useTranslations('recoveryRoom');
  const reduce = useReducedMotion();
  const reward = LEVEL_REWARDS[level];
  const unlockLabels = [
    ...newlyUnlocked.map((item) => room(`decor.${item}`)),
    ...(reward?.themeId ? [room(`theme.${reward.themeId}`)] : []),
  ];

  return (
    <Dialog open onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="max-w-sm text-center">
          <DialogHeader className="items-center">
            <motion.div
              initial={reduce ? false : { scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="bg-azure/60 mx-auto flex size-24 items-center justify-center overflow-hidden rounded-full"
            >
              <Image
                src={levelPoseAsset(level)}
                alt=""
                width={88}
                height={88}
                className="size-20 object-contain"
              />
            </motion.div>
            <DialogTitle className="text-navy mt-3 text-xl font-extrabold">
              {t('levelUpHeading', { count: level })}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-6">
              {t('levelUpNewTitle', { title: t(getLevelTitleKey(level)) })}
            </DialogDescription>
          </DialogHeader>
          {unlockLabels.length > 0 ? (
            <div className="border-navy/10 bg-azure/40 mt-3 rounded-xl border p-3 text-left">
              <p className="text-navy text-xs font-bold tracking-[0.08em] uppercase">
                {t('levelUpUnlocks')}
              </p>
              <ul className="text-navy mt-1.5 space-y-1 text-sm font-semibold">
                {unlockLabels.map((label) => (
                  <li key={label} className="flex items-center gap-2">
                    <span
                      className="bg-navy-light size-1.5 shrink-0 rounded-full"
                      aria-hidden="true"
                    />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              {t('levelUpNoUnlock')}
            </p>
          )}
          <Button className="mt-4 w-full" onClick={onClose}>
            {t('levelUpContinue')}
          </Button>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
