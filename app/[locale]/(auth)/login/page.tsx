'use client';

import { ROUTES } from '@/routes';
import { Link } from '@/i18n/routing';
import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { login, loginWithGoogle, persistAuthSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { AuthShell } from '@/components/auth/AuthShell';
import { AuthField, AuthDivider } from '@/components/auth/AuthField';
import { GoogleIdentityButton } from '@/components/auth/google-identity-button';
import { reportDevelopmentError } from '@/lib/diagnostics';
import { useTranslations } from 'next-intl';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email wajib diisi' })
    .email({ message: 'Format email tidak valid' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: { id: string; email: string; display_name: string; role: string };
}

export default function LoginPage() {
  const t = useTranslations('loginPage');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const completeLogin = (res: AuthResponse) => {
    persistAuthSession(res);
    const requestedNext = new URLSearchParams(window.location.search).get(
      'next'
    );
    const nextPath =
      requestedNext?.startsWith('/') && !requestedNext.startsWith('//')
        ? requestedNext
        : ROUTES.DASHBOARD;
    router.push(nextPath);
  };

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setLoading(true);
    try {
      const res = (await login(data.email, data.password)) as AuthResponse;
      if (res?.access_token) {
        completeLogin(res);
      } else {
        reportDevelopmentError(
          'Password sign-in returned an invalid response',
          new Error('Authentication response did not include an access token.')
        );
        setError(t('loginError'));
      }
    } catch {
      setError(t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (credential: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = (await loginWithGoogle(credential)) as AuthResponse;
      if (!res?.access_token) {
        reportDevelopmentError(
          'Google sign-in returned an invalid response',
          new Error('Authentication response did not include an access token.')
        );
        setError(t('googleError'));
        return;
      }
      completeLogin(res);
    } catch {
      setError(t('googleError'));
    } finally {
      setLoading(false);
    }
  };

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
        <div className="border-crimson/20 bg-crimson/5 text-crimson mb-6 rounded-xl border px-4 py-3 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <AuthField
          label={t('text_238')}
          icon={Mail}
          type="email"
          placeholder={t('text_245')}
          error={errors.email?.message}
          {...formRegister('email')}
        />

        <AuthField
          label={t('text_239')}
          icon={Lock}
          type="password"
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

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full rounded-xl py-6 font-semibold"
          disabled={loading}
        >
          {loading ? t('processing') : t('submit')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>

      <AuthDivider label={t('orDivider')} />
      <GoogleIdentityButton
        onCredential={handleGoogleCredential}
        unavailableLabel={t('googleUnavailable')}
      />
    </AuthShell>
  );
}
