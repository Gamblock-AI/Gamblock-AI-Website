'use client';

import { useState, type FormEvent } from 'react';
import { KeyRound, Lock, Mail } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { ROUTES } from '@/routes';
import { friendlyMessage } from '@/lib/messages';
import { toastSuccess } from '@/lib/feedback';
import { usePasswordReset } from '@/hooks/use-password-reset';
import { AuthField } from '@/components/auth/AuthField';
import { Button } from '@/components/ui/button';

type Copy = {
  email: string;
  code: string;
  password: string;
  request: string;
  confirm: string;
  sent: string;
  success: string;
  detail: string;
  genericError: string;
};

export function PasswordResetForm({ copy }: { copy: Copy }) {
  const router = useRouter();
  const { loading, requestCode, confirmReset } = usePasswordReset();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      if (!requested) {
        await requestCode(email.trim());
        setRequested(true);
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
      <AuthField
        label={copy.email}
        icon={Mail}
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      {requested ? (
        <>
          <AuthField
            label={copy.code}
            icon={KeyRound}
            autoComplete="one-time-code"
            minLength={12}
            maxLength={14}
            required
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
          />
          <AuthField
            label={copy.password}
            icon={Lock}
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </>
      ) : null}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full rounded-xl py-6 font-semibold"
        disabled={loading}
      >
        {requested ? copy.confirm : copy.request}
      </Button>
    </form>
  );
}
