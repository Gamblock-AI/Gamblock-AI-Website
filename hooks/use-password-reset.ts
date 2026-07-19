'use client';

import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';

export function usePasswordReset() {
  const [loading, setLoading] = useState(false);

  const requestCode = useCallback(async (email: string) => {
    setLoading(true);
    try {
      await apiClient('/auth/password-reset/request', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmReset = useCallback(
    async (email: string, code: string, newPassword: string) => {
      setLoading(true);
      try {
        await apiClient('/auth/password-reset/confirm', {
          method: 'POST',
          body: JSON.stringify({
            email,
            code,
            new_password: newPassword,
          }),
        });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, requestCode, confirmReset };
}
