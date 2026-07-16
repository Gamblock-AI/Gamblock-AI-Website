import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

import { config } from './lib/config';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const isProd = config.isProduction;

function getHttpOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.origin
      : null;
  } catch {
    return null;
  }
}

const connectSources = new Set(["'self'", 'https:', 'wss:']);
const configuredApiOrigin = getHttpOrigin(config.apiUrl);

// NEXT_PUBLIC_API_URL is also used by production builds served locally for
// acceptance checks. Permit that one exact origin in every mode so the CSP and
// the client bundle cannot disagree about where the backend lives.
if (configuredApiOrigin) connectSources.add(configuredApiOrigin);

if (!isProd) {
  connectSources.add('http://localhost:*');
  connectSources.add('http://127.0.0.1:*');
  connectSources.add('ws://localhost:*');
  connectSources.add('ws://127.0.0.1:*');
}

const scriptSources = new Set(["'self'", "'unsafe-inline'"]);
if (!isProd) scriptSources.add("'unsafe-eval'");

const googleIdentityEnabled = Boolean(config.googleClientId.trim());
if (googleIdentityEnabled) scriptSources.add('https://accounts.google.com');

const csp = [
  "default-src 'self'",
  `script-src ${Array.from(scriptSources).join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  `connect-src ${Array.from(connectSources).join(' ')}`,
  googleIdentityEnabled
    ? "frame-src 'self' https://accounts.google.com"
    : "frame-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ') + ';';

const nextConfig: NextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        // This no-op worker replaces and retires service workers left behind
        // by older PWA builds. Never cache the retirement script.
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
