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
import { levelPoseAsset } from '@/lib/recovery/level-rewards';
import { getLevelTitleKey } from '@/lib/recovery/level-titles';

/**
 * Calm dedicated level-up moment: the tier's mascot pose and the new journey
 * title. No confetti, no sound, no pressure — a single continue action.
 * Reduced motion renders everything statically.
 */
export function LevelUpMoment({
  level,
  onClose,
}: {
  level: number;
  onClose: () => void;
}) {
  const t = useTranslations('recoveryDashboard');
  const reduce = useReducedMotion();

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
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            {t('levelUpNoUnlock')}
          </p>
          <Button className="mt-4 w-full" onClick={onClose}>
            {t('levelUpContinue')}
          </Button>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
