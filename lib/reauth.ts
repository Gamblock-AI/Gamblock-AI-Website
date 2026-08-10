const listeners = new Set<() => void>();
let activeResolve: ((ok: boolean) => void) | null = null;
let activePromise: Promise<boolean> | null = null;

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

/**
 * Whether a re-authentication dialog is currently open. Surfaces can read this
 * via `useSyncExternalStore` to render the modal.
 */
export function isReauthDialogOpen(): boolean {
  return activeResolve !== null;
}

export function subscribeReauthDialog(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Request a fresh password re-authentication. Resolves `true` when the user
 * successfully re-authenticates (new tokens stored) and `false` when they
 * cancel. Concurrent callers share the same dialog and outcome. If no dialog is
 * mounted (no subscriber), it resolves `false` so callers surface the original
 * error instead of hanging.
 */
export function requestReauth(): Promise<boolean> {
  if (activePromise) return activePromise;
  if (listeners.size === 0) return Promise.resolve(false);
  activePromise = new Promise((resolve) => {
    activeResolve = resolve;
    notifyListeners();
  });
  return activePromise;
}

/** Completes an in-flight re-auth request with the dialog's outcome. */
export function resolveReauth(ok: boolean): void {
  const resolve = activeResolve;
  activeResolve = null;
  activePromise = null;
  if (resolve) resolve(ok);
  notifyListeners();
}
