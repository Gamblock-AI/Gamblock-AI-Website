'use client';

import { ROUTES } from '@/routes';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowLeft, ArrowRight } from 'lucide-react';
import { login } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { useTranslations } from "next-intl";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const loginSchema = z.object({
  email: z.string().min(1, { message: "Email wajib diisi" }).email({ message: "Format email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          href={ROUTES.HOME}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('text_235')}</Link>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          {/* Header */}
          <div className="mb-8 space-y-3">
            <Image
              src="/images/logo.png"
              alt={t('text_244')}
              width={40}
              height={40}
              className="rounded-xl"
            />
            <h2 className="text-heading text-2xl text-navy">
              {t('text_236')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('text_237')}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-crimson/20 bg-crimson/5 px-4 py-3 text-xs font-semibold text-crimson">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-label text-navy">{t('text_238')}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  {...formRegister('email')}
                  placeholder={t('text_245')}
                  className={`w-full rounded-lg border bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-navy focus:ring-2 focus:ring-navy/15 focus:outline-none ${errors.email ? 'border-crimson' : 'border-input'}`}
                />
              </div>
              {errors.email && <p className="text-xs text-crimson font-medium">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-label text-navy">{t('text_239')}</label>
                <Link href="#" className="text-xs font-semibold text-crimson hover:underline">
                  {t('text_240')}</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  {...formRegister('password')}
                  placeholder={t('text_246')}
                  className={`w-full rounded-lg border bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-navy focus:ring-2 focus:ring-navy/15 focus:outline-none ${errors.password ? 'border-crimson' : 'border-input'}`}
                />
              </div>
              {errors.password && <p className="text-xs text-crimson font-medium">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </form>

          {/* Register link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('text_241')}{' '}
            <Link href={ROUTES.REGISTER} className="font-bold text-crimson hover:underline">
              {t('text_242')}</Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground/50">
          {t('text_243')}</p>
      </div>
    </div>
  );
}
