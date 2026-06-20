import { config } from './config';
import { messageForCode, messageForStatus } from './messages';

// Structured API error carrying the backend envelope's `code` and the
// production-safe message. Thrown by lib/api-client.ts whenever a request fails,
// so callers can resolve a friendly message via `ApiError.friendly()` instead of
// surfacing raw HTTP status strings to end users.
export class ApiError extends Error {
  readonly code: string | undefined;
  readonly status: number;

  constructor(status: number, code?: string, message?: string) {
    // Base message: in dev, surface technical detail for debugging; in
    // production, the friendly resolved message.
    const technical = code ? `[${code}] ${message ?? ''}` : `API error: ${status}`;
    super(config.isProduction ? friendly(status, code, message) : technical);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }

  // Production-safe friendly message for this error.
  friendly(): string {
    return friendly(this.status, this.code, this.message);
  }
}

function friendly(status: number, code?: string, message?: string): string {
  // Prefer the backend-provided friendly message when present (production
  // backend already gates its message via its i18n catalog).
  if (message && message.trim()) return message;
  const fromCode = messageForCode(code);
  if (fromCode) return fromCode;
  return messageForStatus(status);
}
