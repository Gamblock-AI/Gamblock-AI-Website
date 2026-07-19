'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

async function confirmEmailVerification(token: string) {
  await apiClient('/auth/email-verification/confirm', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export function useEmailVerification(token: string) {
  const [status, setStatus] = useState<'verifying' | 'verified' | 'error'>(
    token ? 'verifying' : 'error'
  );

  const verify = useCallback(async () => {
    if (!token) {
      setStatus('error');
      return;
    }
    setStatus('verifying');
    try {
      await confirmEmailVerification(token);
      setStatus('verified');
    } catch {
      setStatus('error');
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    let active = true;
    void confirmEmailVerification(token).then(
      () => {
        if (active) setStatus('verified');
      },
      () => {
        if (active) setStatus('error');
      }
    );

    return () => {
      active = false;
    };
  }, [token]);

  return { status: token ? status : 'error', retry: verify };
}
