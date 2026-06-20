import { describe, it, expect, afterEach } from 'vitest';
import { ApiError } from './api-error';

describe('ApiError', () => {
  const origNodeEnv = process.env.NODE_ENV;
  afterEach(() => {
    process.env.NODE_ENV = origNodeEnv;
  });

  it('production: message is friendly (backend-provided message wins)', () => {
    process.env.NODE_ENV = 'production';
    const err = new ApiError(401, 'invalid_credentials', 'Email atau kata sandi salah.');
    expect(err.message).toBe('Email atau kata sandi salah.');
    expect(err.friendly()).toBe('Email atau kata sandi salah.');
    expect(err.code).toBe('invalid_credentials');
    expect(err.status).toBe(401);
  });

  it('production: falls back to catalog when backend gave no message', () => {
    process.env.NODE_ENV = 'production';
    const err = new ApiError(401, 'invalid_credentials', undefined);
    expect(err.message).toBe('Email atau kata sandi salah. Silakan periksa kembali.');
  });

  it('production: falls back to status message when code unknown', () => {
    process.env.NODE_ENV = 'production';
    const err = new ApiError(500, 'mystery', undefined);
    expect(err.message).toContain('Server sedang sibuk');
  });

  it('development: message is technical with code + detail', () => {
    process.env.NODE_ENV = 'development';
    const err = new ApiError(401, 'invalid_credentials', 'user not found');
    expect(err.message).toBe('[invalid_credentials] user not found');
  });
});
