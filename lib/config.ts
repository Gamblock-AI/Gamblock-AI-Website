// Centralized client-side configuration.
//
// Single source of truth for environment-driven settings. Read from here instead
// of process.env scattered across files. NEXT_PUBLIC_* vars are inlined at build
// time by Next.js and are therefore public (client-visible) — never put secrets
// in a NEXT_PUBLIC_* var.

function readIsProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export const config = {
  /** Backend API base URL (no trailing slash). */
  get apiUrl() {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  },
  /**
   * Whether the app runs in production. Gates user-facing messages: production
   * shows friendly, non-leaking text; development shows technical detail.
   * NODE_ENV is set by Next.js at build time; read live so tests can flip it.
   */
  get isProduction() {
    return readIsProduction();
  },
  /** App environment label for debugging displays in dev. */
  get appEnv() {
    return process.env.NODE_ENV || 'development';
  },
} as const;

export type AppConfig = typeof config;
