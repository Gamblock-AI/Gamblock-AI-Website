'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  LockKeyhole,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from '@/i18n/routing';
import { apiClient } from '@/lib/api-client';
import { ROUTES } from '@/routes';

export default function PartnerInvitationPage() {
  const t = useTranslations('partnerInvitationPage');
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState(false);

  const acceptInvitation = async () => {
    if (!token) return;
    setLoading(true);
    setError(false);
    try {
      await apiClient(`/partners/invitations/${token}/accept`, {
        method: 'POST',
      });
      setAccepted(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="border-border w-full max-w-lg overflow-hidden">
        <div className="border-border bg-azure/45 border-b p-6 sm:p-8">
          <div className="bg-navy flex size-12 items-center justify-center rounded-2xl text-white">
            <HeartHandshake className="size-6" aria-hidden="true" />
          </div>
          <p className="text-sage mt-5 text-xs font-bold tracking-[0.12em] uppercase">
            {t('eyebrow')}
          </p>
          <h1 className="text-navy mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {accepted ? t('successTitle') : t('title')}
          </h1>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            {accepted ? t('successBody') : t('description')}
          </p>
        </div>

        <div className="space-y-5 p-6 sm:p-8">
          {accepted ? (
            <>
              <div className="border-sage/25 bg-sage/[0.05] flex items-start gap-3 rounded-2xl border p-4">
                <CheckCircle2 className="text-sage mt-0.5 size-5 shrink-0" />
                <p className="text-foreground text-sm leading-6">
                  {t('successNotice')}
                </p>
              </div>
              <Button
                render={<Link href={ROUTES.ACCOUNTABILITY} />}
                size="lg"
                className="w-full"
              >
                {t('openInbox')}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </>
          ) : (
            <>
              <div className="border-border bg-muted/30 flex items-start gap-3 rounded-2xl border p-4">
                <LockKeyhole className="text-navy mt-0.5 size-5 shrink-0" />
                <div>
                  <h2 className="text-navy text-sm font-bold">
                    {t('privacyTitle')}
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm leading-6">
                    {t('privacyBody')}
                  </p>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="border-crimson/20 bg-crimson/[0.04] flex items-start gap-3 rounded-2xl border p-4"
                >
                  <AlertCircle className="text-crimson mt-0.5 size-5 shrink-0" />
                  <p className="text-crimson text-sm leading-6">
                    {t('errorBody')}
                  </p>
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  render={<Link href={ROUTES.DASHBOARD} />}
                  variant="outline"
                  size="lg"
                >
                  {t('decline')}
                </Button>
                <Button
                  size="lg"
                  disabled={loading || !token}
                  onClick={() => void acceptInvitation()}
                >
                  {loading ? t('accepting') : t('accept')}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </main>
  );
}
