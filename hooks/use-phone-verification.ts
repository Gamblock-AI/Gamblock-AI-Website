'use client';

import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface VerifyResponse {
  verified: boolean;
}

interface ResendResponse {
  sent: boolean;
  preview_code?: string;
}

/**
 * Public WhatsApp OTP flow used by the registration/verify-phone page. Both
 * calls are token-authenticated (verification token from sign-in), so no
 * bearer session is required.
 */
export function usePhoneVerification() {
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const verifyCode = useCallback(
    async (verificationToken: string, code: string): Promise<void> => {
      setVerifying(true);
      try {
        await apiClient<VerifyResponse>('/auth/phone-verification/verify', {
          method: 'POST',
          body: JSON.stringify({ verification_token: verificationToken, code }),
        });
      } finally {
        setVerifying(false);
      }
    },
    []
  );

  const resendCode = useCallback(
    async (verificationToken: string): Promise<ResendResponse | null> => {
      setResending(true);
      try {
        return await apiClient<ResendResponse>(
          '/auth/phone-verification/verify/resend',
          {
            method: 'POST',
            body: JSON.stringify({ verification_token: verificationToken }),
          }
        );
      } finally {
        setResending(false);
      }
    },
    []
  );

  return { verifying, resending, verifyCode, resendCode };
}
