'use client';

import { useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { reauthenticate } from '@/lib/api-client';
import { ApiError } from '@/lib/api-error';
import {
  isReauthDialogOpen,
  resolveReauth,
  subscribeReauthDialog,
} from '@/lib/reauth';
import { cn } from '@/lib/utils';

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
  const [showPassword, setShowPassword] = useState(false);
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
      setShowPassword(false);
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
    setShowPassword(false);
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
        className="border-border/80 bg-card/98 shadow-float backdrop-blur-md animate-in fade-in-0 slide-in-from-top-2 motion-reduce:animate-none pointer-events-auto w-full max-w-lg rounded-2xl border p-4 sm:p-5 ring-1 ring-black/5"
      >
        <div className="flex items-start gap-3.5">
          <span className="bg-azure text-navy ring-1 ring-navy/15 flex size-9 shrink-0 items-center justify-center rounded-xl shadow-2xs mt-0.5">
            <LockKeyhole className="size-4.5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h2 id="reauth-title" className="text-navy text-sm sm:text-base font-bold">
                {t('reauthTitle')}
              </h2>
              <button
                type="button"
                onClick={cancel}
                aria-label={t('reauthCancel')}
                className="text-muted-foreground hover:text-navy hover:bg-muted -mr-1 -mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-navy/30 transition-colors"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <p
              id="reauth-desc"
              className="text-muted-foreground mt-0.5 text-xs leading-relaxed"
            >
              {t('reauthBody')}
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void submit();
              }}
              className="mt-3.5 space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1 min-w-0">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <KeyRound className="size-4" aria-hidden="true" />
                  </span>
                  <input
                    id="reauth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (error) {
                        setError(false);
                        setInvalidCredentials(false);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') cancel();
                    }}
                    autoComplete="current-password"
                    autoFocus
                    placeholder={t('reauthPasswordLabel')}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'reauth-error' : undefined}
                    required
                    className={cn(
                      'bg-background h-10 w-full rounded-xl border pl-9 pr-9 text-sm outline-none transition-all focus-visible:ring-2',
                      error
                        ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20'
                        : 'border-input focus-visible:border-navy focus-visible:ring-navy/20'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    className="text-muted-foreground hover:text-navy absolute right-2.5 top-1/2 -translate-y-1/2 p-1 transition-colors rounded-md focus-visible:ring-2 focus-visible:ring-navy/20"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={cancel}
                    disabled={busy}
                    className="h-10 px-3 text-muted-foreground hover:text-navy rounded-xl text-xs font-semibold"
                  >
                    {t('reauthCancel')}
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={busy || !password}
                    className="h-10 px-4 rounded-xl font-bold bg-navy text-white hover:bg-navy-light shadow-2xs transition-all active:scale-95"
                  >
                    {busy ? (
                      <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-3.5 mr-1.5 text-azure" />
                    )}
                    {busy ? t('reauthSubmitting') : t('reauthConfirm')}
                  </Button>
                </div>
              </div>

              {error ? (
                <p
                  id="reauth-error"
                  className="text-destructive text-xs font-semibold flex items-center gap-1.5 animate-in fade-in-0 duration-150"
                  role="alert"
                >
                  <span className="size-1.5 rounded-full bg-destructive shrink-0" />
                  {invalidCredentials
                    ? t('reauthFailed')
                    : t('reauthFailedGeneric')}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
