'use client';

import { ROUTES } from '@/routes';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowLeft, ArrowRight, User, Users, Shield } from 'lucide-react';
import { register } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { useTranslations } from "next-intl";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const registerSchema = z.object({
  role: z.enum(['user', 'partner']),
  name: z.string().min(3, { message: "Nama minimal 3 karakter" }),
  email: z.string().min(1, { message: "Email wajib diisi" }).email({ message: "Format email tidak valid" }),
  password: z.string().min(8, { message: "Password minimal 8 karakter" }),
  terms: z.literal(true, {
    error: "Anda harus menyetujui syarat & ketentuan",
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: { id: string; email: string; display_name: string; role: string };
}

export default function RegisterPage() {
    const t = useTranslations('registerPage');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register: formRegister,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'user', name: '', email: '', password: '' },
  });

  const role = watch('role');

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    setLoading(true);
    try {
      const res = (await register(data.email, data.password, data.name)) as AuthResponse;
      if (res?.access_token) {
        localStorage.setItem('gamblock_access_token', res.access_token);
        localStorage.setItem('gamblock_refresh_token', res.refresh_token);
        document.cookie = `gamblock_access_token=${res.access_token}; path=/; max-age=${res.expires_in || 3600}; SameSite=Lax; Secure`;
        localStorage.setItem('gamblock_user', JSON.stringify({ ...res.user, role: data.role }));
        if (data.role === 'partner') {
          router.push(ROUTES.CREATE_GROUP);
        } else {
          router.push(ROUTES.DASHBOARD);
        }
      } else {
        setError('Format respon pendaftaran tidak valid.');
      }
    } catch {
      setError('Pendaftaran gagal. Email mungkin sudah terdaftar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link href={ROUTES.HOME} className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-navy">
          <ArrowLeft className="h-4 w-4" /> {t('text_247')}</Link>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-8 space-y-3">
            <Image src="/images/logo.png" alt={t('text_262')} width={40} height={40} className="rounded-xl" />
            <h2 className="text-heading text-2xl text-navy">{t('text_248')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('text_249')}</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-crimson/20 bg-crimson/5 px-4 py-3 text-xs font-semibold text-crimson">
              {error}
            </div>
          )}

          {/* Role Selector */}
          <div className="mb-6 space-y-2">
            <label className="text-label text-navy">{t('text_250')}</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue('role', 'user')}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                  role === 'user'
                    ? 'border-navy/30 bg-navy/5 text-navy'
                    : 'border-border text-muted-foreground hover:border-navy/20'
                }`}
              >
                <User className="h-6 w-6" />
                <span className="text-xs font-bold">Mahasiswa</span>
                <span className="text-[10px] text-muted-foreground">Member</span>
              </button>
              <button
                type="button"
                onClick={() => setValue('role', 'partner')}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                  role === 'partner'
                    ? 'border-navy/30 bg-navy/5 text-navy'
                    : 'border-border text-muted-foreground hover:border-navy/20'
                }`}
              >
                <Shield className="h-6 w-6" />
                <span className="text-xs font-bold">{t('text_251')}</span>
                <span className="text-[10px] text-muted-foreground">Kepala</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-label text-navy">{t('text_252')}</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  {...formRegister('name')}
                  placeholder={t('text_263')}
                  className={`w-full rounded-lg border bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-navy focus:ring-2 focus:ring-navy/15 focus:outline-none ${errors.name ? 'border-crimson' : 'border-input'}`}
                />
              </div>
              {errors.name && <p className="text-xs text-crimson font-medium">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-label text-navy">{t('text_253')}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  {...formRegister('email')}
                  placeholder={t('text_264')}
                  className={`w-full rounded-lg border bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-navy focus:ring-2 focus:ring-navy/15 focus:outline-none ${errors.email ? 'border-crimson' : 'border-input'}`}
                />
              </div>
              {errors.email && <p className="text-xs text-crimson font-medium">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-label text-navy">{t('text_254')}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  {...formRegister('password')}
                  placeholder={t('text_265')}
                  className={`w-full rounded-lg border bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-navy focus:ring-2 focus:ring-navy/15 focus:outline-none ${errors.password ? 'border-crimson' : 'border-input'}`}
                />
              </div>
              {errors.password && <p className="text-xs text-crimson font-medium">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <input type="checkbox" id="terms" {...formRegister('terms')} className="mt-0.5 h-4 w-4 rounded border-input accent-navy" />
                <label htmlFor="terms" className="text-xs leading-relaxed font-medium text-muted-foreground">
                  {t('text_255')}{' '}
                  <Link href="#" className="font-semibold text-navy hover:underline">{t('text_256')}</Link>
                  {' '}dan{' '}
                  <Link href="#" className="font-semibold text-navy hover:underline">{t('text_257')}</Link>
                  {' '}{t('text_258')}</label>
              </div>
              {errors.terms && <p className="text-xs text-crimson font-medium">{errors.terms.message}</p>}
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Memproses...' : role === 'partner' ? 'Buat Akun & Lanjutkan ke Grup' : 'Buat Akun Sekarang'}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('text_259')}{' '}
            <Link href={ROUTES.LOGIN} className="font-bold text-crimson hover:underline">{t('text_260')}</Link>
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground/50">
          {t('text_261')}</p>
      </div>
    </div>
  );
}
