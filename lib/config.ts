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
  /** Public OAuth client identifier used by Google Identity Services. */
  get googleClientId() {
    return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  },
  /** Space/comma separated public origins permitted for education iframes. */
  get educationEmbedOrigins() {
    return (
      process.env.NEXT_PUBLIC_EDUCATION_EMBED_ORIGINS ||
      'https://www.youtube-nocookie.com,https://player.vimeo.com,https://who.int,https://www.who.int,https://ppatk.go.id,https://www.ppatk.go.id,https://ojk.go.id,https://www.ojk.go.id,https://komdigi.go.id,https://www.komdigi.go.id,https://kemkes.go.id,https://www.kemkes.go.id'
    );
  },
  /**
   * Whether the app runs in production. User-facing messages remain friendly
   * in every environment; this flag gates development-only console diagnostics.
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
