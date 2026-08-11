'use client';

import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';
import { useLocalUser } from '@/hooks/use-local-user';
import { useRecoveryJourney } from '@/hooks/use-recovery-journey';
import { NiatPerubahanModal } from './niat-perubahan-modal';
import { DashboardTour } from '@/components/dashboard/tour/dashboard-tour';
import { apiClient } from '@/lib/api-client';
import { GamiDailyRecommendation } from './gami-daily-recommendation';

const subscribeToClientReady = () => () => undefined;

interface SyncIntention {
  id?: string;
}

export function NiatPerubahanGate({
  children,
  studentName,
}: {
  children: React.ReactNode;
  studentName: string;
}) {
  const user = useLocalUser();
  const recovery = useRecoveryJourney();
  const [data, setData] = useState<SyncIntention | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [tourSettled, setTourSettled] = useState(false);
  const clientReady = useSyncExternalStore(
    subscribeToClientReady,
    () => true,
    () => false,
  );

  const shouldCheck = clientReady && user.role === 'user';

  useEffect(() => {
    if (!shouldCheck) return;

    let active = true;

    apiClient<SyncIntention>('/intentions')
      .then((result) => {
        if (!active) return;
        if (!result || !result.id) {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
        setData(result);
      })
      .catch(() => {
        if (active) setFetchError(true);
      });

    return () => {
      active = false;
    };
  }, [shouldCheck]);

  const resolved = data !== null || fetchError;
  const needsIntention = data !== null && !data?.id;
  const needsCheckIn = !recovery.todayCheckIn;
  const showModal =
    shouldCheck && resolved && !fetchError && (needsIntention || needsCheckIn);
  const settleTour = useCallback(() => setTourSettled(true), []);

  if (!shouldCheck) return <>{children}</>;

  return (
    <>
      {children}
      {showModal ? (
        <NiatPerubahanModal
          needsIntention={needsIntention}
          needsCheckIn={needsCheckIn}
          onCompleted={() => {
            setData({ id: 'completed' });
            window.dispatchEvent(
              new CustomEvent('gamblock:recovery-data-changed')
            );
            window.dispatchEvent(
              new CustomEvent('gamblock:recovery-sync-changed')
            );
          }}
        />
      ) : null}
      {resolved && !showModal && !tourSettled ? (
        <DashboardTour onSettled={settleTour} />
      ) : null}
      {resolved && !showModal && tourSettled ? (
        <GamiDailyRecommendation studentName={studentName} />
      ) : null}
    </>
  );
}
