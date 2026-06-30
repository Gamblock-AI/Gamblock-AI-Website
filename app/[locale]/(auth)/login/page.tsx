'use client';

import { ROUTES } from '@/routes';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { login } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { AuthShell } from '@/components/auth/AuthShell';
import { AuthField, AuthDivider, GoogleButton } from '@/components/auth/AuthField';
import { useTranslations } from 'next-intl';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const loginSchema = z.object({
  email: z.string().min(1, { message: 'Email wajib diisi' }).email({ message: 'Format email tidak valid' }),
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

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setLoading(true);
    try {
      const res = (await login(data.email, data.password)) as AuthResponse;
      if (res?.access_token) {
        localStorage.setItem('gamblock_access_token', res.access_token);
        localStorage.setItem('gamblock_refresh_token', res.refresh_token);
        document.cookie = `gamblock_access_token=${res.access_token}; path=/; max-age=${res.expires_in || 3600}; SameSite=Lax; Secure`;
        localStorage.setItem('gamblock_user', JSON.stringify(res.user));
        router.push(ROUTES.DASHBOARD);
      } else {
        setError('Respon server tidak valid.');
      }
    } catch {
      setError('Login gagal. Email tidak ditemukan atau server offline.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    alert('Fitur login dengan Google belum diimplementasikan.');
  };

  return (
    <AuthShell
      heading={t('text_236')}
      subheading={t('text_237')}
      footer={
        <p className="text-center text-sm text-muted-foreground">
          {t('text_241')}{' '}
          <Link href={ROUTES.REGISTER} className="font-semibold text-crimson hover:text-crimson/80">
            {t('text_242')}
          </Link>
        </p>
      }
    >
      {error && (
        <div className="mb-6 rounded-xl border border-crimson/20 bg-crimson/5 px-4 py-3 text-xs font-semibold text-crimson">
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
            <Link href={ROUTES.FORGOT_PASSWORD} className="text-xs font-semibold text-crimson hover:text-crimson/80">
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
      <GoogleButton label={t('googleContinue')} onClick={handleGoogleLogin} />
    </AuthShell>
  );
}
