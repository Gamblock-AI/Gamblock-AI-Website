'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';
import { GamiCard } from '@/components/dashboard/gami-card';
import { useDayOfYear } from '@/hooks/use-daily-rotation';
import { gamiDialogKey, gamiFollowUp } from '@/lib/recovery/gami-dialog';
import type { MoodLevel, UrgeLevel } from '@/lib/recovery/types';

/**
 * GamiMoodResponse — supportive mascot reply to the selected mood in the
 * daily check-in. The line varies by mood × urge band with a deterministic
 * daily variant (30-line curated bank, no randomness in render). Mood 1 keeps
 * the direct route to human support; a real urge on other moods offers a
 * two-minute practice instead. Enter/exit animates height so the urge
 * fieldset below never jumps.
 */
export function GamiMoodResponse({
  mood,
  urge,
}: {
  mood: MoodLevel | null;
  urge?: UrgeLevel | null;
}) {
  const t = useTranslations('gamiDialog');
  const reduce = useReducedMotion();
  const dayIndex = useDayOfYear();

  const dialogKey = mood === null ? null : gamiDialogKey(mood, urge, dayIndex);
  const followUp = mood === null ? null : gamiFollowUp(mood, urge);

  const card =
    mood === null || dialogKey === null ? null : (
      <GamiCard
        message={t(dialogKey)}
        action={
          followUp === 'support' ? (
            <Link
              href={ROUTES.SUPPORT}
              className="bg-navy hover:bg-navy-light focus-visible:ring-navy/30 inline-flex min-h-11 items-center rounded-full px-4 text-sm font-bold text-white transition-colors outline-none focus-visible:ring-2"
            >
              {t('followUpSupport')}
            </Link>
          ) : followUp === 'practice' ? (
            <Link
              href={ROUTES.RECOVERY}
              className="border-navy/20 text-navy hover:bg-azure/45 focus-visible:ring-navy/30 inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-bold transition-colors outline-none focus-visible:ring-2"
            >
              {t('followUpPractice')}
            </Link>
          ) : undefined
        }
      />
    );

  if (reduce) return card;

  return (
    <AnimatePresence initial={false} mode="wait">
      {mood !== null && dialogKey !== null ? (
        <motion.div
          key={dialogKey}
          className="overflow-hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {card}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
