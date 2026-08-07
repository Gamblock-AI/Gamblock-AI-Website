'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useLocalUser } from '@/hooks/use-local-user';
import { NiatPerubahanModal } from './niat-perubahan-modal';
import { apiClient } from '@/lib/api-client';

const subscribeToClientReady = () => () => undefined;

interface SyncIntention {
  id?: string;
}

export function NiatPerubahanGate({ children }: { children: React.ReactNode }) {
  const user = useLocalUser();
  const [data, setData] = useState<SyncIntention | null>(null);
  const [fetchError, setFetchError] = useState(false);
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

  const showModal =
    shouldCheck && data !== null && !fetchError && !data?.id;

  if (!shouldCheck) return <>{children}</>;

  return (
    <>
      {children}
      {showModal && (
        <NiatPerubahanModal onCompleted={() => setData({ id: 'completed' })} />
      )}
    </>
  );
}
