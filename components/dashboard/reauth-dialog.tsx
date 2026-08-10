'use client';

import { useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { LockKeyhole, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { reauthenticate } from '@/lib/api-client';
import { ApiError } from '@/lib/api-error';
import {
  isReauthDialogOpen,
  resolveReauth,
  subscribeReauthDialog,
} from '@/lib/reauth';

/**
 * Global re-authentication prompt, mounted once in the dashboard layout and
 * opened on demand by `requestReauth()` when a recent-auth-protected action is
 * rejected. Rendered as a top-anchored security bar (not a stacked modal) so it
 * never visually stacks over the dialog that triggered it.
 */
export function ReauthDialog() {
  const t = useTranslations('shared');
  const open = useSyncExternalStore(
    subscribeReauthDialog,
    isReauthDialogOpen,
    () => false
  );
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [invalidCredentials, setInvalidCredentials] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (busy || !password) return;
    setBusy(true);
    setError(false);
    try {
      await reauthenticate(password);
      setPassword('');
      resolveReauth(true);
    } catch (err) {
      setError(true);
      setInvalidCredentials(
        err instanceof ApiError && err.code === 'invalid_credentials'
      );
    } finally {
      setBusy(false);
    }
  };

  const cancel = () => {
    setPassword('');
    setError(false);
    resolveReauth(false);
  };

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[95] flex justify-center px-4 pt-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reauth-title"
        aria-describedby="reauth-desc"
        className="border-border/80 bg-card shadow-float animate-in fade-in-0 slide-in-from-top-2 motion-reduce:animate-none pointer-events-auto w-full max-w-md rounded-2xl border p-4"
      >
        <div className="flex items-start gap-3">
          <span className="bg-azure/80 text-navy flex size-9 shrink-0 items-center justify-center rounded-xl">
            <LockKeyhole className="size-4.5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h2 id="reauth-title" className="text-navy text-sm font-bold">
                {t('reauthTitle')}
              </h2>
              <button
                type="button"
                onClick={cancel}
                aria-label={t('reauthCancel')}
                className="text-muted-foreground hover:text-navy hover:bg-muted -mr-1 -mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-navy/30"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <p
              id="reauth-desc"
              className="text-muted-foreground mt-1 text-xs leading-relaxed"
            >
              {t('reauthBody')}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                id="reauth-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void submit();
                  if (event.key === 'Escape') cancel();
                }}
                autoComplete="current-password"
                autoFocus
                placeholder={t('reauthPasswordLabel')}
                className="border-input bg-background focus-visible:border-navy focus-visible:ring-navy/20 h-10 min-w-0 flex-1 basis-40 rounded-xl border px-3 text-sm outline-none focus-visible:ring-2"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => void submit()}
                disabled={busy || !password}
                className="rounded-xl"
              >
                {busy ? t('reauthSubmitting') : t('reauthConfirm')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={cancel}
                disabled={busy}
                className="text-muted-foreground rounded-xl"
              >
                {t('reauthCancel')}
              </Button>
            </div>

            {error ? (
              <p className="mt-2 text-xs font-semibold text-red-600" role="alert">
                {invalidCredentials
                  ? t('reauthFailed')
                  : t('reauthFailedGeneric')}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
