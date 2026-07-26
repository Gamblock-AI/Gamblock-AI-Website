'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';
import { GamiCard } from '@/components/dashboard/gami-card';
import { moodSupportCopy } from './dashboard-copy';
import type { MoodLevel } from '@/lib/recovery/types';

/**
 * GamiMoodResponse — supportive mascot reply to the selected mood in the
 * daily check-in. For the most distressed mood it also offers a direct route
 * to human support, without any diagnostic claim. Enter/exit animates height
 * so the urge fieldset below never jumps.
 */
export function GamiMoodResponse({ mood }: { mood: MoodLevel | null }) {
  const t = useTranslations('recoveryDashboard');
  const reduce = useReducedMotion();

  const card =
    mood === null ? null : (
      <GamiCard
        message={t(moodSupportCopy[mood])}
        action={
          mood === 1 ? (
            <Link
              href={ROUTES.SUPPORT}
              className="bg-navy hover:bg-navy-light focus-visible:ring-navy/30 inline-flex min-h-11 items-center rounded-full px-4 text-sm font-bold text-white transition-colors outline-none focus-visible:ring-2"
            >
              {t('moodSupportHelp')}
            </Link>
          ) : undefined
        }
      />
    );

  if (reduce) return card;

  return (
    <AnimatePresence initial={false} mode="wait">
      {mood !== null ? (
        <motion.div
          key={mood}
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
