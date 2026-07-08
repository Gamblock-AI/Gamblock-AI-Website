'use client';

import { ROUTES } from '@/routes';
import { Link } from '@/i18n/routing';
import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Mail, Lock, ArrowRight, User, Shield } from 'lucide-react';
import { register } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { AuthShell } from '@/components/auth/AuthShell';
import { AuthField } from '@/components/auth/AuthField';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const registerSchema = z.object({
  role: z.enum(['user', 'partner']),
  name: z.string().min(3, { message: 'Nama minimal 3 karakter' }),
  email: z.string().min(1, { message: 'Email wajib diisi' }).email({ message: 'Format email tidak valid' }),
  password: z.string().min(8, { message: 'Password minimal 8 karakter' }),
  terms: z.literal(true, { error: 'Anda harus menyetujui syarat & ketentuan' }),
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
        router.push(data.role === 'partner' ? ROUTES.CREATE_GROUP : ROUTES.DASHBOARD);
      } else {
        setError('Format respon pendaftaran tidak valid.');
      }
    } catch {
      setError('Pendaftaran gagal. Email mungkin sudah terdaftar.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'user' as const, icon: User, title: t('roleMember'), sub: t('roleMemberSub') },
    { value: 'partner' as const, icon: Shield, title: t('rolePartner'), sub: t('rolePartnerSub') },
  ];

  return (
    <AuthShell
      heading={t('text_248')}
      subheading={t('text_249')}
      footer={
        <p className="text-center text-sm text-muted-foreground">
          {t('text_259')}{' '}
          <Link href={ROUTES.LOGIN} className="font-semibold text-crimson hover:text-crimson/80">
            {t('text_260')}
          </Link>
        </p>
      }
    >
      {error && (
        <div className="mb-6 rounded-xl border border-crimson/20 bg-crimson/5 px-4 py-3 text-xs font-semibold text-crimson">
          {error}
        </div>
      )}

      {/* Role selector */}
      <div className="mb-5 space-y-2">
        <label className="text-sm font-semibold text-navy">{t('text_250')}</label>
        <div className="grid grid-cols-2 gap-3">
          {roles.map(({ value, icon: Icon, title, sub }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('role', value)}
              className={cn(
                'flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-4 transition-all',
                role === value
                  ? 'border-navy bg-navy/5 text-navy ring-2 ring-navy/15'
                  : 'border-border text-muted-foreground hover:border-navy/30',
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-bold">{title}</span>
              <span className="text-[10px] text-muted-foreground">{sub}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <AuthField
          label={t('text_252')}
          icon={User}
          type="text"
          placeholder={t('text_263')}
          error={errors.name?.message}
          {...formRegister('name')}
        />
        <AuthField
          label={t('text_253')}
          icon={Mail}
          type="email"
          placeholder={t('text_264')}
          error={errors.email?.message}
          {...formRegister('email')}
        />
        <AuthField
          label={t('text_254')}
          icon={Lock}
          type="password"
          placeholder={t('text_265')}
          error={errors.password?.message}
          {...formRegister('password')}
        />

        <div className="space-y-1.5">
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              id="terms"
              {...formRegister('terms')}
              className="mt-0.5 h-4 w-4 rounded border-input accent-navy"
            />
            <label htmlFor="terms" className="text-xs font-medium leading-relaxed text-muted-foreground">
              {t('text_255')}{' '}
              <Link href={ROUTES.TERMS} className="font-semibold text-navy hover:underline">{t('text_256')}</Link>{' '}
              {t('termsAnd')}{' '}
              <Link href={ROUTES.PRIVACY} className="font-semibold text-navy hover:underline">{t('text_257')}</Link>{' '}
              {t('text_258')}
            </label>
          </div>
          {errors.terms && <p className="text-xs font-medium text-crimson">{errors.terms.message}</p>}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full rounded-xl py-6 font-semibold"
          disabled={loading}
        >
          {loading ? t('processing') : role === 'partner' ? t('submitPartner') : t('submitMember')}
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </form>
    </AuthShell>
  );
}
