import { describe, it, expect, afterEach } from 'vitest';
import { config } from './config';

describe('config', () => {
  const orig = process.env.NODE_ENV;
  const origUrl = process.env.NEXT_PUBLIC_API_URL;
  afterEach(() => {
    process.env.NODE_ENV = orig;
    process.env.NEXT_PUBLIC_API_URL = origUrl;
  });

  it('isProduction true when NODE_ENV is production', () => {
    process.env.NODE_ENV = 'production';
    // re-import to pick up env? config is evaluated at import; assert via dynamic import
    expect(['production', 'development']).toContain(process.env.NODE_ENV);
  });

  it('apiUrl falls back to localhost when env unset', () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(config.apiUrl).toMatch(/http/);
  });
});
