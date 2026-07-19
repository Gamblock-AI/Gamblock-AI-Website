import { describe, it, expect } from 'vitest';
import { messageForCode, messageForStatus, friendlyMessage } from './messages';

describe('messages catalog', () => {
  it('returns the friendly message for a known code', () => {
    expect(messageForCode('invalid_credentials')).toBe(
      'Email atau kata sandi salah. Silakan periksa kembali.'
    );
  });

  it('returns null for an unknown code', () => {
    expect(messageForCode('not_a_real_code')).toBeNull();
  });

  it('returns null for empty/undefined code', () => {
    expect(messageForCode(undefined)).toBeNull();
    expect(messageForCode('')).toBeNull();
  });

  it('maps known HTTP statuses', () => {
    expect(messageForStatus(401)).toContain('masuk kembali');
    expect(messageForStatus(500)).toContain('Layanan sedang mengalami kendala');
  });

  it('falls back to generic for unknown status', () => {
    expect(messageForStatus(599)).toContain('Terjadi kendala');
  });

  it('friendlyMessage resolves an ApiError-like object by code', () => {
    const err = { code: 'join_failed', status: 400 };
    expect(friendlyMessage(err)).toBe('Kode grup tidak valid. Coba lagi.');
  });

  it('friendlyMessage falls back to status message when code unknown', () => {
    const err = { code: 'mystery', status: 404 };
    expect(friendlyMessage(err)).toBe('Data yang diminta tidak ditemukan.');
  });

  it('friendlyMessage returns generic for shapeless errors', () => {
    expect(friendlyMessage(new Error('boom'))).toContain('Terjadi kendala');
  });

  it('resolves structurally and honors localized fallbacks', () => {
    expect(
      friendlyMessage(
        { code: 'current_password_invalid', status: 400 },
        undefined,
        'en'
      )
    ).toBe('Your current password is incorrect.');
    expect(
      friendlyMessage({ code: 'unknown', status: 400 }, 'Try again', 'en')
    ).toBe('Try again');
  });

  it('gives browser connection failures a recovery-focused message', () => {
    const error = new TypeError('Failed to fetch');
    expect(friendlyMessage(error)).toBe(
      'Tidak dapat terhubung ke layanan. Periksa koneksi dan coba lagi.'
    );
    expect(friendlyMessage(error, undefined, 'en')).toBe(
      'Could not connect to the service. Check your connection and try again.'
    );
  });
});
