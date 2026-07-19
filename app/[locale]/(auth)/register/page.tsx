'use client';

import { ROUTES } from '@/routes';
import { Link } from '@/i18n/routing';
import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Mail, Lock, ArrowRight, User, Shield } from 'lucide-react';
import { register } from '@/lib/auth';
import { persistAuthSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { AuthShell } from '@/components/auth/AuthShell';
import { AuthField } from '@/components/auth/AuthField';
import { cn } from '@/lib/utils';
import { reportDevelopmentError } from '@/lib/diagnostics';
import { useTranslations } from 'next-intl';
import { friendlyMessage } from '@/lib/messages';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

type RegisterFormValues = {
  role: 'user' | 'partner';
  name: string;
  email: string;
  password: string;
  terms: true;
};

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: { id: string; email: string; display_name: string; role: string };
}

export default function RegisterPage() {
  const t = useTranslations('registerPage');
  const authT = useTranslations('authShell');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const registerSchema = z.object({
    role: z.enum(['user', 'partner']),
    name: z.string().min(3, { message: t('validation.nameMinimum') }),
    email: z
      .string()
      .min(1, { message: t('validation.emailRequired') })
      .email({ message: t('validation.emailInvalid') }),
    password: z.string().min(8, { message: t('validation.passwordMinimum') }),
    terms: z.literal(true, { error: t('validation.termsRequired') }),
  });

  const {
    register: formRegister,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'user', name: '', email: '', password: '' },
  });

  const role = useWatch({ control, name: 'role' });

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    setLoading(true);
    try {
      const res = (await register(
        data.email,
        data.password,
        data.name,
        data.role
      )) as AuthResponse;
      if (res?.access_token) {
        persistAuthSession(res);
        router.push(
          data.role === 'partner' ? ROUTES.PARTNERS : ROUTES.DASHBOARD
        );
      } else {
        reportDevelopmentError(
          'Registration returned an invalid response',
          new Error('Registration response did not include an access token.')
        );
        setError(t('registrationError'));
      }
    } catch (error) {
      setError(friendlyMessage(error, t('registrationError')));
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      value: 'user' as const,
      icon: User,
      title: t('roleMember'),
      sub: t('roleMemberSub'),
    },
    {
      value: 'partner' as const,
      icon: Shield,
      title: t('rolePartner'),
      sub: t('rolePartnerSub'),
    },
  ];

  return (
    <AuthShell
      heading={t('text_248')}
      subheading={t('text_249')}
      backFallbackHref={ROUTES.LOGIN}
      backLabel={authT('backLogin')}
      footer={
        <p className="text-muted-foreground text-center text-sm">
          {t('text_259')}{' '}
          <Link
            href={ROUTES.LOGIN}
            className="text-crimson hover:text-crimson/80 font-semibold"
          >
            {t('text_260')}
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

      {/* Role selector */}
      <div className="mb-5 space-y-2">
        <label className="text-navy text-sm font-semibold">
          {t('text_250')}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {roles.map(({ value, icon: Icon, title, sub }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('role', value)}
              aria-pressed={role === value}
              className={cn(
                'flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-4 transition-all',
                role === value
                  ? 'border-navy bg-navy/5 text-navy ring-navy/15 ring-2'
                  : 'border-border text-muted-foreground hover:border-navy/30'
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-bold">{title}</span>
              <span className="text-muted-foreground text-[10px]">{sub}</span>
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
              className="border-input accent-navy mt-0.5 h-4 w-4 rounded"
            />
            <label
              htmlFor="terms"
              className="text-muted-foreground text-xs leading-relaxed font-medium"
            >
              {t('text_255')}{' '}
              <Link
                href={ROUTES.TERMS}
                className="text-navy font-semibold hover:underline"
              >
                {t('text_256')}
              </Link>{' '}
              {t('termsAnd')}{' '}
              <Link
                href={ROUTES.PRIVACY}
                className="text-navy font-semibold hover:underline"
              >
                {t('text_257')}
              </Link>{' '}
              {t('text_258')}
            </label>
          </div>
          {errors.terms && (
            <p role="alert" className="text-crimson text-xs font-medium">
              {errors.terms.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full rounded-xl py-6 font-semibold"
          disabled={loading}
        >
          {loading
            ? t('processing')
            : role === 'partner'
              ? t('submitPartner')
              : t('submitMember')}
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </form>
    </AuthShell>
  );
}
