'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { KeyRound, Lock, Mail } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { ROUTES } from '@/routes';
import { friendlyMessage } from '@/lib/messages';
import { toastSuccess } from '@/lib/feedback';
import { usePasswordReset } from '@/hooks/use-password-reset';
import { AuthField } from '@/components/auth/AuthField';
import { LoadingButton } from '@/components/common/loading-button';

type Copy = {
  email: string;
  emailPlaceholder?: string;
  code: string;
  codePlaceholder?: string;
  password: string;
  passwordPlaceholder?: string;
  request: string;
  confirm: string;
  sent: string;
  success: string;
  detail: string;
  genericError: string;
};

export function PasswordResetForm({ copy }: { copy: Copy }) {
  const t = useTranslations('forgotPasswordPage');
  const router = useRouter();
  const { loading, requestCode, confirmReset } = usePasswordReset();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      if (!requested) {
        const result = await requestCode(email.trim());
        setRequested(true);
        if (result?.preview_code) setPreview(result.preview_code);
        toastSuccess(copy.sent);
        return;
      }
      await confirmReset(email.trim(), code.trim(), password);
      toastSuccess(copy.success);
      router.push(ROUTES.LOGIN);
    } catch (requestError) {
      setError(friendlyMessage(requestError, copy.genericError));
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <p className="text-muted-foreground text-sm leading-6">{copy.detail}</p>
      {error ? (
        <p
          role="alert"
          aria-live="assertive"
          className="border-crimson/20 bg-crimson/5 text-crimson rounded-xl border px-4 py-3 text-sm"
        >
          {error}
        </p>
      ) : null}
      {preview ? (
        <p className="bg-azure/60 text-navy border-sky/20 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold">
          <KeyRound className="size-4 shrink-0" aria-hidden="true" />
          {t('previewCode', { code: preview })}
        </p>
      ) : null}
      <AuthField
        label={copy.email}
        icon={Mail}
        type="email"
        autoComplete="email"
        placeholder={copy.emailPlaceholder}
        error={!requested ? (error || undefined) : undefined}
        required
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          if (error) setError(null);
        }}
      />
      {requested ? (
        <>
          <AuthField
            label={copy.code}
            icon={KeyRound}
            autoComplete="one-time-code"
            placeholder={copy.codePlaceholder}
            minLength={12}
            maxLength={14}
            required
            value={code}
            onChange={(event) => {
              setCode(event.target.value.toUpperCase());
              if (error) setError(null);
            }}
          />
          <AuthField
            label={copy.password}
            icon={Lock}
            type="password"
            autoComplete="new-password"
            placeholder={copy.passwordPlaceholder}
            minLength={8}
            error={error || undefined}
            required
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setError(null);
            }}
          />
        </>
      ) : null}
      <LoadingButton
        type="submit"
        variant="primary"
        size="lg"
        className="w-full rounded-xl font-semibold"
        loading={loading}
      >
        {requested ? copy.confirm : copy.request}
      </LoadingButton>
    </form>
  );
}
