'use client';

import { toast } from 'sonner';
import { reportDevelopmentError } from './diagnostics';
import { friendlyMessage } from './messages';

// Centralized user-facing feedback. Wraps sonner toasts with brand-consistent
// styling and ensures errors always show a friendly (production-safe) message.
// Technical context is sent only to the development console.

export function toastSuccess(message: string) {
  toast.success(message);
}

export function toastError(error: unknown, fallback?: string) {
  reportDevelopmentError('UI action failed', error);
  toast.error(friendlyMessage(error, fallback));
}

// Convenience for mutation flows: shows a success toast on resolve, a friendly
// error toast on reject. Returns the result or rethrows after toasting.
export async function withFeedback<T>(
  promise: Promise<T>,
  successMessage: string
): Promise<T> {
  try {
    const result = await promise;
    toastSuccess(successMessage);
    return result;
  } catch (err) {
    toastError(err);
    throw err;
  }
}
