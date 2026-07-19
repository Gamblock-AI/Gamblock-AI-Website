'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { KeyRound, Mail, ShieldCheck, User } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AuthShell } from '@/components/auth/AuthShell';
import { AuthField } from '@/components/auth/AuthField';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { apiClient } from '@/lib/api-client';
import { ROUTES } from '@/routes';

interface OperatorInvitation {
  email: string;
  role: string;
  expires_at: string;
}

export default function OperatorInvitationPage() {
  const t = useTranslations('operatorInvitation');
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [invitation, setInvitation] = useState<OperatorInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    void apiClient<OperatorInvitation>(`/operator/invitations/${token}`)
      .then((item) => {
        if (active) setInvitation(item);
      })
      .catch(() => {
        if (active) setInvalid(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      await apiClient(`/operator/invitations/${token}/accept`, {
        method: 'POST',
        body: JSON.stringify({ display_name: name, password }),
      });
      setSuccess(true);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      heading={t('title')}
      subheading={t('description')}
      backFallbackHref={ROUTES.HOME}
    >
      {loading ? (
        <p className="text-muted-foreground py-10 text-center text-sm">
          {t('loading')}
        </p>
      ) : null}
      {invalid ? (
        <div className="border-border bg-muted/40 rounded-2xl border p-6 text-center">
          <ShieldCheck className="text-navy mx-auto size-8" />
          <h2 className="text-navy mt-4 font-bold">{t('invalidTitle')}</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {t('invalidBody')}
          </p>
        </div>
      ) : null}
      {success ? (
        <div className="space-y-5 text-center">
          <div className="bg-sage/10 text-sage mx-auto flex size-12 items-center justify-center rounded-2xl">
            <ShieldCheck className="size-6" />
          </div>
          <p className="text-muted-foreground text-sm leading-6">
            {t('success')}
          </p>
          <Link
            href={ROUTES.LOGIN}
            className="bg-navy inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-bold text-white"
          >
            {t('login')}
          </Link>
        </div>
      ) : null}
      {invitation && !success ? (
        <form onSubmit={(event) => void submit(event)} className="space-y-5">
          <div className="border-border bg-muted/40 grid gap-3 rounded-2xl border p-4 sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-xs">{t('email')}</p>
              <p className="text-navy mt-1 text-sm font-bold break-all">
                {invitation.email}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">{t('role')}</p>
              <p className="text-navy mt-1 text-sm font-bold">
                {invitation.role}
              </p>
            </div>
          </div>
          <AuthField
            label={t('name')}
            icon={User}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <div>
            <AuthField
              label={t('password')}
              icon={KeyRound}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
            <p className="text-muted-foreground mt-1.5 text-xs">
              {t('passwordHint')}
            </p>
          </div>
          {error ? (
            <p className="text-crimson text-sm font-semibold" role="alert">
              {t('error')}
            </p>
          ) : null}
          <Button className="w-full" size="lg" disabled={submitting}>
            <Mail className="size-4" />
            {submitting ? t('submitting') : t('submit')}
          </Button>
        </form>
      ) : null}
    </AuthShell>
  );
}
