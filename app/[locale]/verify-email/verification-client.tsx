'use client';

import { BadgeCheck, CircleAlert, LoaderCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useEmailVerification } from '@/hooks/use-email-verification';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';

export function EmailVerificationClient({ token }: { token: string }) {
  const t = useTranslations('emailVerification');
  const verification = useEmailVerification(token);

  const state = {
    verifying: {
      icon: LoaderCircle,
      title: t('verifyingTitle'),
      body: t('verifyingBody'),
    },
    verified: {
      icon: BadgeCheck,
      title: t('verifiedTitle'),
      body: t('verifiedBody'),
    },
    error: {
      icon: CircleAlert,
      title: t('errorTitle'),
      body: t('errorBody'),
    },
  }[verification.status];
  const Icon = state.icon;

  return (
    <main className="bg-muted/35 flex min-h-screen items-center justify-center px-4 py-12">
      <section className="border-border bg-card shadow-card w-full max-w-lg rounded-3xl border p-6 text-center sm:p-9">
        <span className="bg-navy mx-auto flex size-14 items-center justify-center rounded-2xl text-white">
          <Icon
            className={`size-6 ${verification.status === 'verifying' ? 'animate-spin motion-reduce:animate-none' : ''}`}
            aria-hidden="true"
          />
        </span>
        <p className="text-navy-light mt-5 text-xs font-bold tracking-[0.12em] uppercase">
          Gamblock-AI
        </p>
        <h1 className="text-navy mt-2 text-2xl font-extrabold tracking-tight">
          {state.title}
        </h1>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          {state.body}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {verification.status === 'error' ? (
            <Button variant="outline" onClick={() => void verification.retry()}>
              {t('retry')}
            </Button>
          ) : null}
          {verification.status !== 'verifying' ? (
            <Button render={<Link href={ROUTES.LOGIN} />} nativeButton={false}>
              {t('continue')}
            </Button>
          ) : null}
        </div>
      </section>
    </main>
  );
}
