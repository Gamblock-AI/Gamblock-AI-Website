'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

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
      await apiClient('/auth/email-verification/confirm', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      setStatus('verified');
    } catch {
      setStatus('error');
    }
  }, [token]);

  useEffect(() => {
    void verify();
  }, [verify]);

  return { status, retry: verify };
}
