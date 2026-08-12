'use client';

import { useState, useSyncExternalStore, type FormEvent } from 'react';
import { KeyRound, RefreshCcw, ShieldCheck, ArrowRight } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/routes';
import { AuthShell } from '@/components/auth/AuthShell';
import { AuthField } from '@/components/auth/AuthField';
import { LoadingButton } from '@/components/common/loading-button';
import { usePhoneVerification } from '@/hooks/use-phone-verification';
import {
  clearVerificationContext,
  readVerificationContext,
  subscribeVerificationContext,
} from '@/lib/auth';
import { friendlyMessage } from '@/lib/messages';
import { toastSuccess } from '@/lib/feedback';

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) return phone;
  const tail = 4;
  const head = Math.min(3, digits.length - tail);
  return `${digits.slice(0, head)}****${digits.slice(-tail)}`;
}

export default function VerifyPhonePage() {
  const t = useTranslations('verifyPhonePage');
  const router = useRouter();
  const { verifying, resending, verifyCode, resendCode } =
    usePhoneVerification();
  const context = useSyncExternalStore(
    subscribeVerificationContext,
    readVerificationContext,
    () => null
  );
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState('');

  if (!context) {
    return (
      <AuthShell
        heading={t('sessionMissingTitle')}
        subheading={t('sessionMissingBody')}
      >
        <Link
          href={ROUTES.LOGIN}
          className="text-crimson hover:text-crimson/80 font-semibold"
        >
          {t('backToLogin')}
        </Link>
      </AuthShell>
    );
  }

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (code.trim().length !== 6) {
      setError(t('codeInvalid'));
      return;
    }
    try {
      await verifyCode(context.token, code.trim());
      clearVerificationContext();
      router.push(ROUTES.LOGIN);
    } catch (err) {
      setError(friendlyMessage(err, t('verifyError')));
    }
  };

  const handleResend = async () => {
    setError(null);
    try {
      const result = await resendCode(context.token);
      if (result?.preview_code) setPreview(result.preview_code);
      toastSuccess(t('resendSent'));
    } catch (err) {
      setError(friendlyMessage(err, t('verifyError')));
    }
  };

  return (
    <AuthShell
      heading={t('title')}
      subheading={t('description', { phone: maskPhone(context.phone) })}
    >
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="border-crimson/20 bg-crimson/5 text-crimson mb-6 rounded-xl border px-4 py-3 text-xs font-semibold"
        >
          {error}
        </div>
      )}

      <form onSubmit={(event) => void handleVerify(event)} className="space-y-5">
        <AuthField
          label={t('codeLabel')}
          icon={KeyRound}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          pattern="[0-9]*"
          placeholder={t('codePlaceholder')}
          value={code}
          onChange={(event) =>
            setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
          }
        />

        <LoadingButton
          type="submit"
          variant="primary"
          size="lg"
          className="w-full rounded-xl font-semibold"
          loading={verifying}
        >
          {t('submit')}
          <ArrowRight className="size-4" />
        </LoadingButton>
      </form>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={() => void handleResend()}
          disabled={resending}
          className="text-navy hover:text-navy-light flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
        >
          {resending ? (
            <>
              <RefreshCcw className="size-4 animate-spin motion-reduce:animate-none" />
              {t('resending')}
            </>
          ) : (
            <>
              <RefreshCcw className="size-4" />
              {t('resend')}
            </>
          )}
        </button>

        {preview ? (
          <p className="bg-azure/60 text-navy flex items-center justify-center gap-2 rounded-xl border border-sky/20 px-3 py-2 text-xs font-semibold">
            <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
            {t('previewCodeHint', { code: preview })}
          </p>
        ) : null}
      </div>
    </AuthShell>
  );
}
