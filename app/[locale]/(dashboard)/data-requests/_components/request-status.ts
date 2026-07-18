export function getRequestStatus(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === 'completed') {
    return { key: 'completed', tone: 'sage' as const };
  }
  if (normalized === 'rejected') {
    return { key: 'rejected', tone: 'crimson' as const };
  }
  if (normalized === 'cancelled') {
    return { key: 'cancelled', tone: 'muted' as const };
  }
  if (normalized === 'processing') {
    return { key: 'processing', tone: 'amber' as const };
  }
  return { key: 'pending', tone: 'navy' as const };
}
