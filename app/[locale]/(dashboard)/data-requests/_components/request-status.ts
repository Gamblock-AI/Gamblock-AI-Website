export function getRequestStatus(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === 'completed') {
    return { key: 'completed', tone: 'sage' as const };
  }
  if (normalized === 'rejected') {
    return { key: 'rejected', tone: 'crimson' as const };
  }
  if (normalized === 'failed') {
    return { key: 'failed', tone: 'crimson' as const };
  }
  if (normalized === 'cancelled') {
    return { key: 'cancelled', tone: 'muted' as const };
  }
  if (normalized === 'processing') {
    return { key: 'processing', tone: 'amber' as const };
  }
  if (normalized === 'pending_confirmation') {
    return { key: 'pendingConfirmation', tone: 'amber' as const };
  }
  return { key: 'pending', tone: 'navy' as const };
}

type ExportAvailability =
  | { kind: 'ready'; expiresAt: Date }
  | { kind: 'expired' | 'unavailable' | 'failed' | 'none' };

export function getExportAvailability(
  request: {
    type: string;
    status: string;
    result_expires_at?: string;
    failure_code?: string;
  },
  now = new Date()
): ExportAvailability {
  if (request.type !== 'export') return { kind: 'none' };
  if (request.failure_code === 'result_expired') return { kind: 'expired' };
  if (request.failure_code === 'result_unavailable') {
    return { kind: 'unavailable' };
  }
  if (request.status === 'failed') return { kind: 'failed' };
  if (request.status !== 'completed') return { kind: 'none' };

  const expiresAt = request.result_expires_at
    ? new Date(request.result_expires_at)
    : null;
  if (!expiresAt || Number.isNaN(expiresAt.getTime())) {
    return { kind: 'unavailable' };
  }
  if (expiresAt <= now) return { kind: 'expired' };
  return { kind: 'ready', expiresAt };
}
