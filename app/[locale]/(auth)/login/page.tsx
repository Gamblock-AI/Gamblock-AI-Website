'use client';

import { defaultRouteForRole, ROUTES } from '@/routes';
import { Link } from '@/i18n/routing';
import { type FormEvent, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import {
  beginVerificationFlow,
  completeInitialPasswordChange,
  login,
  persistAuthSession,
} from '@/lib/auth';
import type { AuthResponse } from '@/lib/auth';
import { LoadingButton } from '@/components/common/loading-button';
import { AuthShell } from '@/components/auth/AuthShell';
import { AuthField } from '@/components/auth/AuthField';
import { reportDevelopmentError } from '@/lib/diagnostics';
import { useTranslations } from 'next-intl';
import { friendlyMessage } from '@/lib/messages';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const t = useTranslations('loginPage');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordChangeToken, setPasswordChangeToken] = useState<string | null>(
    null
  );
  const [newPassword, setNewPassword] = useState('');
  const loginSchema = z.object({
    email: z
      .string()
      .min(1, { message: t('validation.emailRequired') })
      .email({ message: t('validation.emailInvalid') }),
    password: z.string().min(6, { message: t('validation.passwordMinimum') }),
  });

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const completeLogin = (res: AuthResponse) => {
    if (res.verification_required && res.verification_token) {
      const requestedNext = new URLSearchParams(window.location.search).get(
        'next'
      );
      beginVerificationFlow(
        res,
        'login',
        requestedNext && !requestedNext.startsWith('//')
          ? requestedNext
          : undefined
      );
      router.push(ROUTES.VERIFY_PHONE);
      return;
    }
    if (!res.access_token) {
      reportDevelopmentError(
        'Password sign-in returned an invalid response',
        new Error('Authentication response did not include an access token.')
      );
      setError(t('loginError'));
      return;
    }
    persistAuthSession(res);
    const requestedNext = new URLSearchParams(window.location.search).get(
      'next'
    );
    const nextPath =
      requestedNext?.startsWith('/') && !requestedNext.startsWith('//')
        ? requestedNext
        : defaultRouteForRole(res.user?.role);
    router.push(nextPath);
  };

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setLoading(true);
    try {
      const res = (await login(data.email, data.password)) as AuthResponse;
      if (res?.password_change_required && res.password_change_token) {
        setPasswordChangeToken(res.password_change_token);
      } else if (
        res?.access_token ||
        (res?.verification_required && res.verification_token)
      ) {
        completeLogin(res);
      } else {
        reportDevelopmentError(
          'Password sign-in returned an invalid response',
          new Error('Authentication response did not include an access token.')
        );
        setError(t('loginError'));
      }
    } catch (error) {
      setError(friendlyMessage(error, t('loginError')));
    } finally {
      setLoading(false);
    }
  };

  const submitInitialPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!passwordChangeToken || newPassword.length < 8) {
      setError(t('initialPassword.minLengthError'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = (await completeInitialPasswordChange(
        passwordChangeToken,
        newPassword
      )) as AuthResponse;
      completeLogin(response);
    } catch (requestError) {
      setError(friendlyMessage(requestError, t('initialPassword.errorFallback')));
    } finally {
      setLoading(false);
    }
  };

  if (passwordChangeToken) {
  return (
      <AuthShell
        heading={t('initialPassword.heading')}
        subheading={t('initialPassword.subheading')}
      >
        {error ? (
          <div
            role="alert"
            className="border-crimson/20 bg-crimson/5 text-crimson mb-6 rounded-xl border px-4 py-3 text-xs font-semibold"
          >
            {error}
          </div>
        ) : null}
        <form
          onSubmit={(event) => void submitInitialPassword(event)}
          className="space-y-5"
        >
          <AuthField
            label={t('initialPassword.newPasswordLabel')}
            icon={Lock}
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            minLength={8}
            required
          />
          <LoadingButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full rounded-xl font-semibold"
            loading={loading}
          >
            {t('initialPassword.submit')}
            <ArrowRight className="size-4" />
          </LoadingButton>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      heading={t('text_236')}
      subheading={t('text_237')}
      footer={
        <p className="text-muted-foreground text-center text-sm">
          {t('text_241')}{' '}
          <Link
            href={ROUTES.REGISTER}
            className="text-crimson hover:text-crimson/80 font-semibold"
          >
            {t('text_242')}
          </Link>
        </p>
      }
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <AuthField
          label={t('text_238')}
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder={t('text_245')}
          error={errors.email?.message}
          {...formRegister('email')}
        />

        <AuthField
          label={t('text_239')}
          icon={Lock}
          type="password"
          autoComplete="current-password"
          placeholder={t('text_246')}
          error={errors.password?.message}
          labelAdornment={
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-crimson hover:text-crimson/80 text-xs font-semibold"
            >
              {t('text_240')}
            </Link>
          }
          {...formRegister('password')}
        />

        <LoadingButton
          type="submit"
          variant="primary"
          size="lg"
          className="w-full rounded-xl font-semibold"
          loading={loading}
        >
          {t('submit')}
          <ArrowRight className="size-4" />
        </LoadingButton>
      </form>
    </AuthShell>
  );
}
