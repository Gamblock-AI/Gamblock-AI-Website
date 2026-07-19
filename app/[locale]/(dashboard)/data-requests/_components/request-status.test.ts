import { describe, expect, it } from 'vitest';
import { getExportAvailability, getRequestStatus } from './request-status';

describe('data request status', () => {
  it('only exposes a completed export while its download window is active', () => {
    const now = new Date('2026-07-19T00:00:00Z');
    expect(
      getExportAvailability(
        {
          type: 'export',
          status: 'completed',
          result_expires_at: '2026-07-20T00:00:00Z',
        },
        now
      )
    ).toEqual({
      kind: 'ready',
      expiresAt: new Date('2026-07-20T00:00:00Z'),
    });
    expect(
      getExportAvailability({ type: 'export', status: 'completed' }, now)
    ).toEqual({ kind: 'unavailable' });
  });

  it('distinguishes expired, unavailable, and failed exports', () => {
    expect(
      getExportAvailability({
        type: 'export',
        status: 'completed',
        failure_code: 'result_expired',
      })
    ).toEqual({ kind: 'expired' });
    expect(
      getExportAvailability({
        type: 'export',
        status: 'completed',
        failure_code: 'result_unavailable',
      })
    ).toEqual({ kind: 'unavailable' });
    expect(getExportAvailability({ type: 'export', status: 'failed' })).toEqual(
      { kind: 'failed' }
    );
  });

  it('keeps unknown workflow statuses pending', () => {
    expect(getRequestStatus('queued')).toEqual({
      key: 'pending',
      tone: 'navy',
    });
  });
});
