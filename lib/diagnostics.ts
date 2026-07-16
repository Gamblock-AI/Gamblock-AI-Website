import { config } from './config';

type DiagnosticDetails = Record<string, unknown>;

function isExpectedClientRejection(error: unknown): boolean {
  if (!(error instanceof Error) || !('status' in error)) return false;

  const status = (error as Error & { status?: unknown }).status;
  return (
    typeof status === 'number' &&
    Number.isInteger(status) &&
    status >= 400 &&
    status < 500
  );
}

function describeError(error: unknown): unknown {
  if (!(error instanceof Error)) return error;

  const diagnostic = error as Error & {
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
  if (config.isProduction || isExpectedClientRejection(error)) return;
  console.error(`[Gamblock AI] ${scope}`, {
    ...details,
    error: describeError(error),
  });
}
