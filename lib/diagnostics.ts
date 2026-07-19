import { config } from './config';
import { errorStatus, isNetworkFailure } from './messages';

type DiagnosticDetails = Record<string, unknown>;

function isExpectedClientRejection(error: unknown): boolean {
  const status = errorStatus(error);
  return status !== undefined && status >= 400 && status < 500;
}

function describeError(error: unknown): unknown {
  if (!error || typeof error !== 'object') return { type: typeof error };

  const diagnostic = error as Partial<Error> & {
    code?: string;
    status?: number;
    diagnosticMessage?: string;
  };

  return {
    name: diagnostic.name,
    message: diagnostic.message,
    code: diagnostic.code,
    status: diagnostic.status,
    technical: diagnostic.diagnosticMessage,
  };
}

const reportedErrors = new WeakSet<object>();

/**
 * Send implementation details to the developer console only. Never pass form
 * values, tokens, URLs, or other user data through `details`.
 */
export function reportDevelopmentError(
  scope: string,
  error: unknown,
  details?: DiagnosticDetails
) {
  // Validation, authentication, authorization, and other expected 4xx results
  // are represented in the UI. Keep the console for unexpected failures such
  // as network errors, malformed responses, and server-side faults.
  if (
    config.isProduction ||
    isExpectedClientRejection(error) ||
    isNetworkFailure(error)
  ) {
    return;
  }
  if (error && typeof error === 'object') {
    if (reportedErrors.has(error)) return;
    reportedErrors.add(error);
  }
  console.error(`[Gamblock AI] ${scope}`, {
    ...details,
    error: describeError(error),
  });
}
