export function getRequestStatus(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes('complete')) {
    return { key: 'completed', tone: 'sage' as const };
  }
  if (normalized.includes('reject') || normalized.includes('fail')) {
    return { key: 'failed', tone: 'crimson' as const };
  }
  if (normalized.includes('process')) {
    return { key: 'processing', tone: 'amber' as const };
  }
  return { key: 'pending', tone: 'navy' as const };
}
