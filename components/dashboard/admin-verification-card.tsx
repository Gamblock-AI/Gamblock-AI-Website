'use client';

import { useState } from 'react';
import { MailCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

export function AdminVerificationCard() {
  const t = useTranslations('adminPage');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle'
  );

  const resend = async () => {
    setState('sending');
    try {
      await apiClient('/auth/email-verification/resend', { method: 'POST' });
      setState('sent');
    } catch {
      setState('error');
    }
  };

  return (
    <section className="border-amber/35 bg-amber/[0.08] rounded-2xl border p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="bg-amber/20 text-navy flex size-10 shrink-0 items-center justify-center rounded-xl">
          <MailCheck className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-navy font-bold">{t('verificationTitle')}</h2>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-6">
            {t('verificationBody')}
          </p>
          {state === 'error' ? (
            <p className="text-crimson mt-2 text-sm" role="alert">
              {t('verificationError')}
            </p>
          ) : null}
          <Button
            className="mt-4"
            disabled={state === 'sending' || state === 'sent'}
            onClick={() => void resend()}
          >
            {state === 'sending'
              ? t('verificationSending')
              : state === 'sent'
                ? t('verificationSent')
                : t('verificationAction')}
          </Button>
        </div>
      </div>
    </section>
  );
}
