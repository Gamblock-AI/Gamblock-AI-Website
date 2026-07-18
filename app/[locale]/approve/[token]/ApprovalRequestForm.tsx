'use client';

import { CheckCircle, Loader2, Shield, XCircle } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ApprovalDetails } from '@/hooks/use-approval';
import { useResolveApproval } from '@/hooks/use-approval';
import {
  dynamicLabelFallback,
  dynamicLabelKey,
} from '@/lib/i18n/dynamic-labels';

export function ApprovalRequestForm({
  details,
  token,
  onResolved,
}: {
  details: ApprovalDetails;
  token: string;
  onResolved: (status: 'approved' | 'denied') => void;
}) {
  const t = useTranslations('approvalFlow');
  const tDynamic = useTranslations('dynamicLabels');
  const locale = useLocale();
  const { resolve, submitting, error } = useResolveApproval(
    details.request_id,
    token
  );
  const parsedDate = details.created_at ? new Date(details.created_at) : null;
  const date =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
          parsedDate
        )
      : t('dateUnavailable');

  const handleResolve = async (status: 'approved' | 'denied') => {
    const ok = await resolve(status);
    if (ok) onResolved(status);
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <div className="bg-crimson/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
            <Shield className="text-crimson h-7 w-7" aria-hidden="true" />
          </div>
          <h2 className="text-heading text-navy text-xl">{t('title')}</h2>
          <p className="text-muted-foreground mt-2 text-sm">{t('body')}</p>
        </div>

        <dl className="border-border bg-muted/30 mt-6 space-y-3 rounded-xl border p-4">
          <div className="flex justify-between gap-4 text-sm">
            <dt className="text-muted-foreground">{t('action')}</dt>
            <dd className="text-navy text-right font-semibold">
              {tDynamic(dynamicLabelKey('approvalAction', details.action), {
                minutes: details.requested_duration_minutes,
                value: dynamicLabelFallback(details.action),
              })}
            </dd>
          </div>
          {details.requested_duration_minutes > 0 ? (
            <div className="flex justify-between gap-4 text-sm">
              <dt className="text-muted-foreground">{t('duration')}</dt>
              <dd className="text-navy font-semibold">
                {t('durationMinutes', {
                  minutes: details.requested_duration_minutes,
                })}
              </dd>
            </div>
          ) : null}
          {details.reason ? (
            <div className="flex justify-between gap-4 text-sm">
              <dt className="text-muted-foreground">{t('reason')}</dt>
              <dd className="text-navy max-w-[200px] text-right font-semibold">
                {details.reason}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4 text-sm">
            <dt className="text-muted-foreground">{t('date')}</dt>
            <dd className="text-navy font-semibold">{date}</dd>
          </div>
        </dl>

        {error ? (
          <p className="text-crimson mt-4 text-sm" role="alert">
            {t(`errors.${error}`)}
          </p>
        ) : null}

        <div className="mt-6 flex gap-3">
          <Button
            variant="accent"
            className="flex-1"
            onClick={() => void handleResolve('denied')}
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {t('deny')}
          </Button>
          <Button
            variant="wellness"
            className="flex-1"
            onClick={() => void handleResolve('approved')}
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {t('approve')}
          </Button>
        </div>

        <p className="text-muted-foreground mt-4 text-center text-xs">
          {t('footer')}
        </p>
      </Card>
    </div>
  );
}
