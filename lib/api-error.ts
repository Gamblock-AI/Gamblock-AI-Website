import { messageForCode, messageForStatus } from './messages';

// Structured API error carrying the backend envelope's stable code/status.
// Its public message is always safe for UI rendering. Development-only detail
// is kept separately for lib/diagnostics.ts and never returned by friendly().
export class ApiError extends Error {
  readonly code: string | undefined;
  readonly status: number;
  readonly diagnosticMessage: string;

  constructor(status: number, code?: string, message?: string) {
    super(friendly(status, code));
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    const detailState = message?.trim()
      ? 'backend detail withheld'
      : 'no backend detail';
    this.diagnosticMessage = code
      ? `[${code}] HTTP ${status} (${detailState})`
      : `HTTP ${status} (${detailState})`;
  }

  // Safe in every environment; technical details belong in the dev console.
  friendly(): string {
    return friendly(this.status, this.code);
  }
}

function friendly(status: number, code?: string): string {
  const fromCode = messageForCode(code);
  if (fromCode) return fromCode;
  return messageForStatus(status);
}
