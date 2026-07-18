'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export interface ApprovalDetails {
  request_id: string;
  action: string;
  reason: string;
  requested_duration_minutes: number;
  status: string;
  created_at: string;
}

export type ResolveStatus = 'approved' | 'denied';
export type ApprovalErrorCode =
  | 'missing_token'
  | 'invalid_token'
  | 'resolve_failed';

export interface UseApprovalVerificationResult {
  details: ApprovalDetails | null;
  loading: boolean;
  error: ApprovalErrorCode | null;
  refetch: () => Promise<void>;
}

// Verifies a quick-approval token (PRD §5.2) and returns the pending request
// details. Token-authenticated, not session-authenticated.
export function useApprovalVerification(
  token: string | null
): UseApprovalVerificationResult {
  const [details, setDetails] = useState<ApprovalDetails | null>(null);
  // Loading starts true only when a token is present; without a token there is
  // nothing to verify, so we surface the missing-token error immediately.
  const [loading, setLoading] = useState<boolean>(Boolean(token));
  const [error, setError] = useState<ApprovalErrorCode | null>(
    token ? null : 'missing_token'
  );

  const verify = useCallback(async () => {
    if (!token) {
      setError('missing_token');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient<ApprovalDetails>(
        `/approval-requests/verify/${token}`
      );
      setDetails(data);
    } catch {
      setError('invalid_token');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Verify on mount. setState only after `await` (lint-safe, no setTimeout).
  // The missing-token case is handled by the initial state above, so this effect
  // does not need to setState synchronously when there is no token.
  useEffect(() => {
    if (!token) return;
    let active = true;
    (async () => {
      try {
        const data = await apiClient<ApprovalDetails>(
          `/approval-requests/verify/${token}`
        );
        if (!active) return;
        setDetails(data);
      } catch {
        if (!active) return;
        setError('invalid_token');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

  return { details, loading, error, refetch: verify };
}

export interface UseResolveApprovalResult {
  resolve: (status: ResolveStatus) => Promise<boolean>;
  submitting: boolean;
  error: ApprovalErrorCode | null;
}

// Resolves an approval request by token (approve/deny) — PRD §5.2 quick link.
export function useResolveApproval(
  requestId: string | undefined,
  token: string
): UseResolveApprovalResult {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApprovalErrorCode | null>(null);

  const resolve = useCallback(
    async (status: ResolveStatus): Promise<boolean> => {
      if (!requestId) return false;
      setSubmitting(true);
      setError(null);
      try {
        await apiClient(`/approval-requests/${requestId}/resolve-by-token`, {
          method: 'POST',
          body: JSON.stringify({ token, status }),
        });
        return true;
      } catch {
        setError('resolve_failed');
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [requestId, token]
  );

  return { resolve, submitting, error };
}
