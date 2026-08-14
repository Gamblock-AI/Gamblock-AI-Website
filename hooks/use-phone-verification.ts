'use client';

import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import type { AuthResponse } from '@/lib/auth';

interface ResendResponse {
  sent: boolean;
  preview_code?: string;
}

/**
 * Public WhatsApp OTP flow used by the registration/login verify-phone page.
 * Both calls are token-authenticated (verification token from sign-in), so no
 * bearer session is required. A successful verify returns the issued auth
 * pair so a login-origin flow can continue straight to the dashboard.
 */
export function usePhoneVerification() {
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const verifyCode = useCallback(
    async (
      verificationToken: string,
      code: string
    ): Promise<AuthResponse | null> => {
      setVerifying(true);
      try {
        return await apiClient<AuthResponse>(
          '/auth/phone-verification/verify',
          {
            method: 'POST',
            body: JSON.stringify({ verification_token: verificationToken, code }),
          }
        );
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
