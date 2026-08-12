import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RECOVERY_STORAGE_KEY } from './constants';
import {
  clearRecoveryRuntime,
  getRecoverySnapshot,
  refreshRecoveryAccount,
  updateRecoveryState,
} from './runtime';

const TODAY = '2026-08-12';

function setAccount(accountId: string | null) {
  if (accountId === null) {
    window.localStorage.removeItem('gamblock_user');
  } else {
    window.localStorage.setItem(
      'gamblock_user',
      JSON.stringify({ id: accountId })
    );
  }
}

function addTodayCheckIn() {
  updateRecoveryState((state) => ({
    ...state,
    checkIns: [
      {
        id: 'chk_acct',
        date: TODAY,
        mood: 3,
        urge: 2,
        recordedAt: new Date().toISOString(),
      },
    ],
  }));
}

beforeEach(() => {
  window.localStorage.clear();
  refreshRecoveryAccount();
});

afterEach(() => {
  window.localStorage.clear();
  clearRecoveryRuntime();
});

describe('recovery store account scoping', () => {
  it('persists state under the account-scoped key', () => {
    setAccount('acct-a');
    refreshRecoveryAccount();
    addTodayCheckIn();

    expect(
      window.localStorage.getItem(`${RECOVERY_STORAGE_KEY}:acct-a`)
    ).not.toBeNull();
    expect(
      window.localStorage.getItem(`${RECOVERY_STORAGE_KEY}:acct-b`)
    ).toBeNull();
  });

  it('does not leak another account check-in into a new account', () => {
    setAccount('acct-a');
    refreshRecoveryAccount();
    addTodayCheckIn();

    setAccount('acct-b');
    refreshRecoveryAccount();

    const snapshot = getRecoverySnapshot();
    expect(snapshot.checkIns).toHaveLength(0);
    expect(snapshot.intentions).toHaveLength(0);
  });

  it('restores the original account data when switching back', () => {
    setAccount('acct-a');
    refreshRecoveryAccount();
    addTodayCheckIn();

    setAccount('acct-b');
    refreshRecoveryAccount();
    expect(getRecoverySnapshot().checkIns).toHaveLength(0);

    setAccount('acct-a');
    refreshRecoveryAccount();
    expect(getRecoverySnapshot().checkIns).toHaveLength(1);
    expect(getRecoverySnapshot().checkIns[0].date).toBe(TODAY);
  });

  it('falls back to the base key when no account is stored', () => {
    setAccount(null);
    refreshRecoveryAccount();
    addTodayCheckIn();

    expect(
      window.localStorage.getItem(RECOVERY_STORAGE_KEY)
    ).not.toBeNull();
  });
});
