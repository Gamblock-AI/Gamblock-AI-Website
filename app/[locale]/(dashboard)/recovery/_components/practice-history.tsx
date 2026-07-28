'use client';

import { useSyncExternalStore } from 'react';
import { History } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { RecoveryPracticeSession } from '@/hooks/use-recovery-experience';
import { RECOVERY_TIME_ZONE } from '@/lib/recovery/date';

const subscribeNever = () => () => {};
const monthFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  timeZone: RECOVERY_TIME_ZONE,
});
// Current Jakarta month, resolved once per session on the client; empty during
// SSR so hydration stays deterministic.
let cachedMonthKey: string | null = null;
const getMonthKey = () => (cachedMonthKey ??= monthFormatter.format(new Date()));
const getMonthKeyServer = () => '';

/**
 * Surfaces the user's own practice trail back to them: sessions this month
 * and, once there is enough signal, the gentle observation that practicing
 * usually leaves them feeling lighter. Read-only; reuses the practices query
 * already fetched by the recovery experience hook.
 */
export function PracticeHistory({
  practices,
}: {
  practices: { data: RecoveryPracticeSession[] | null; loading: boolean };
}) {
  const t = useTranslations('recoveryRoom');
  const monthKey = useSyncExternalStore(
    subscribeNever,
    getMonthKey,
    getMonthKeyServer
  );

  if (practices.loading || !practices.data || monthKey === '') return null;

  const thisMonth = practices.data.filter(
    (session) => monthFormatter.format(new Date(session.completed_at)) === monthKey
  );
  const withFeedback = thisMonth.filter(
    (session) => session.feedback && session.feedback !== 'prefer_not_say'
  );
  const lighterCount = withFeedback.filter(
    (session) => session.feedback === 'lighter'
  ).length;
  const showLighter =
    withFeedback.length >= 3 && lighterCount * 2 > withFeedback.length;

  return (
    <section className="border-border bg-card rounded-2xl border p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-2.5">
        <span
          className="bg-azure/60 text-navy flex size-8 shrink-0 items-center justify-center rounded-lg"
          aria-hidden="true"
        >
          <History className="size-4" />
        </span>
        <h3 className="text-navy text-sm font-bold">
          {t('practiceHistoryTitle')}
        </h3>
      </div>
      <p className="text-navy mt-2 text-sm font-semibold">
        {thisMonth.length > 0
          ? t('practiceHistoryCount', { count: thisMonth.length })
          : t('practiceHistoryEmpty')}
      </p>
      {showLighter ? (
        <p className="text-muted-foreground mt-1 text-sm leading-6">
          {t('practiceHistoryLighter')}
        </p>
      ) : null}
    </section>
  );
}
