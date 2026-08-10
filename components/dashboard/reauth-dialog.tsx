'use client';

import { useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { LockKeyhole } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { reauthenticate } from '@/lib/api-client';
import {
  isReauthDialogOpen,
  resolveReauth,
  subscribeReauthDialog,
} from '@/lib/reauth';

/**
 * Global password re-authentication dialog. Mounted once in the dashboard
 * layout; opened on demand by `requestReauth()` when a recent-auth-protected
 * action is rejected, so the caller can retry with a fresh auth_time.
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

  if (!open) return null;

  const submit = async () => {
    if (busy || !password) return;
    setBusy(true);
    setError(false);
    try {
      await reauthenticate(password);
      setPassword('');
      resolveReauth(true);
    } catch {
      setError(true);
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
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden="true"
        onClick={cancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reauth-title"
        aria-describedby="reauth-desc"
        className="border-border/80 bg-card shadow-float animate-in fade-in-0 zoom-in-95 relative w-full max-w-sm rounded-2xl border p-5"
      >
        <div className="flex items-start gap-3">
          <span className="bg-azure/80 text-navy flex size-10 shrink-0 items-center justify-center rounded-xl">
            <LockKeyhole className="size-4.5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="reauth-title" className="text-navy text-base font-bold">
              {t('reauthTitle')}
            </h2>
            <p
              id="reauth-desc"
              className="text-muted-foreground mt-1 text-xs leading-relaxed"
            >
              {t('reauthBody')}
            </p>
          </div>
        </div>

        <label
          htmlFor="reauth-password"
          className="text-navy mt-4 block text-xs font-semibold"
        >
          {t('reauthPasswordLabel')}
        </label>
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
          className="border-input bg-background focus-visible:border-navy focus-visible:ring-navy/20 mt-1.5 h-10 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-2"
        />
        {error ? (
          <p className="mt-2 text-xs font-semibold text-red-600" role="alert">
            {t('reauthFailed')}
          </p>
        ) : null}

        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={cancel}
            disabled={busy}
          >
            {t('reauthCancel')}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => void submit()}
            disabled={busy || !password}
          >
            {busy ? t('reauthSubmitting') : t('reauthConfirm')}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
