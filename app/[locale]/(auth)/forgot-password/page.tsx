'use client';

import { ROUTES } from '@/routes';
import { Link } from '@/i18n/routing';
import { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthShell } from '@/components/auth/AuthShell';
import { AuthField } from '@/components/auth/AuthField';
import { useTranslations } from 'next-intl';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  email: z.string().min(1, { message: 'Email wajib diisi' }).email({ message: 'Format email tidak valid' }),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const t = useTranslations('forgotPasswordPage');
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    // Always show a neutral success state to avoid leaking which emails exist.
    await new Promise((r) => setTimeout(r, 600));
    setSentTo(data.email);
    setLoading(false);
  };

  return (
    <AuthShell
      heading={t('heading')}
      subheading={t('subheading')}
      footer={
        <Link
          href={ROUTES.LOGIN}
          className="group inline-flex w-full items-center justify-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {t('backToLogin')}
        </Link>
      }
    >
      {sentTo ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sage/10">
            <MailCheck className="h-7 w-7 text-sage" />
          </div>
          <h2 className="text-title text-lg text-navy">{t('sentTitle')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t('sentBody')} <span className="font-semibold text-navy">{sentTo}</span>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <AuthField
            label={t('emailLabel')}
            icon={Mail}
            type="email"
            placeholder={t('emailPlaceholder')}
            error={errors.email?.message}
            {...formRegister('email')}
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
      )}
    </AuthShell>
  );
}
