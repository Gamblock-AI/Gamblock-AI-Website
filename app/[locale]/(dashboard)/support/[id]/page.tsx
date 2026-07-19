'use client';

import { type FormEvent, useState } from 'react';
import {
  ArrowLeft,
  LifeBuoy,
  LockKeyhole,
  RefreshCw,
  Send,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
  DashboardPanel,
} from '@/components/dashboard/dashboard-page';
import { SupportStatusBadge } from '@/components/dashboard/support-status-badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSupportCase } from '@/hooks/use-support-request';
import { Link } from '@/i18n/routing';
import { toastError, toastSuccess } from '@/lib/feedback';
import { ROUTES } from '@/routes';

export default function SupportCaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations('supportWorkspace');
  const locale = useLocale();
  const support = useSupportCase(id);
  const [reply, setReply] = useState('');
  const item = support.data;
  const date = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const sendReply = async (event: FormEvent) => {
    event.preventDefault();
    if (!reply.trim()) return;
    try {
      await support.reply(reply.trim());
      setReply('');
      toastSuccess(t('replySent'));
    } catch (error) {
      toastError(error);
    }
  };

  const transition = async (status: 'closed' | 'waiting_support') => {
    try {
      await support.transition(status);
      toastSuccess(
        status === 'closed' ? t('ticketClosed') : t('ticketReopened')
      );
    } catch (error) {
      toastError(error);
    }
  };

  return (
    <DashboardPage>
      <Link
        href={ROUTES.SUPPORT_HISTORY}
        className="text-navy focus-visible:ring-navy/30 inline-flex min-h-10 items-center gap-2 self-start rounded-lg text-sm font-semibold outline-none hover:underline focus-visible:ring-2"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t('backToTickets')}
      </Link>
      <DashboardPageHeader
        icon={LifeBuoy}
        eyebrow={t('ticketDetailEyebrow')}
        title={item?.title ?? t('ticketDetailLoading')}
        description={
          item ? t('ticketDetailDescription', { id: item.id }) : t('loading')
        }
        aside={item ? <SupportStatusBadge status={item.status} /> : undefined}
      />

      <DashboardNotice icon={LockKeyhole} title={t('threadPrivacyTitle')}>
        {t('threadPrivacyBody')}
      </DashboardNotice>

      {support.error ? (
        <DashboardNotice
          icon={RefreshCw}
          title={t('historyError')}
          tone="amber"
          action={
            <Button variant="outline" onClick={() => void support.refetch()}>
              {t('historyRetry')}
            </Button>
          }
        />
      ) : null}

      {item ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <DashboardPanel
            icon={Send}
            title={t('conversationTitle')}
            description={t('conversationBody')}
          >
            <ol className="space-y-3" aria-label={t('conversationTitle')}>
              {(item.messages ?? []).map((message) => (
                <li
                  key={message.id}
                  className={`max-w-[90%] rounded-xl border p-4 ${
                    message.author_role === 'support_operator'
                      ? 'border-sage/30 bg-sage/[0.07]'
                      : 'border-border bg-muted/45 ml-auto'
                  }`}
                >
                  <div className="text-muted-foreground flex flex-wrap justify-between gap-2 text-xs">
                    <span className="text-navy font-semibold">
                      {message.author_role === 'support_operator'
                        ? t('supportTeam')
                        : t('you')}
                    </span>
                    <time dateTime={message.created_at}>
                      {formatDate(date, message.created_at)}
                    </time>
                  </div>
                  <p className="text-foreground mt-2 text-sm leading-6 whitespace-pre-wrap">
                    {message.content}
                  </p>
                </li>
              ))}
            </ol>
            {item.status !== 'closed' ? (
              <form
                onSubmit={(event) => void sendReply(event)}
                className="border-border mt-5 space-y-3 border-t pt-5"
              >
                <label
                  htmlFor="support-reply"
                  className="text-navy text-sm font-semibold"
                >
                  {t('replyLabel')}
                </label>
                <Textarea
                  id="support-reply"
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  maxLength={4000}
                  className="min-h-28"
                  placeholder={t('replyPlaceholder')}
                  required
                />
                <Button type="submit" disabled={support.submitting}>
                  <Send className="size-4" aria-hidden="true" />
                  {t('sendReply')}
                </Button>
              </form>
            ) : null}
          </DashboardPanel>

          <DashboardPanel
            icon={LifeBuoy}
            title={t('ticketActionsTitle')}
            description={t('ticketActionsBody')}
          >
            <dl className="space-y-3 text-sm">
              <Detail label={t('priorityLabel')} value={item.priority} />
              <Detail label={t('impactLabel')} value={item.impact || '-'} />
              <Detail
                label={t('createdLabel')}
                value={formatDate(date, item.created_at)}
              />
            </dl>
            {item.status === 'resolved' ? (
              <div className="mt-5 grid gap-2">
                <Button
                  variant="outline"
                  disabled={support.submitting}
                  onClick={() => void transition('waiting_support')}
                >
                  {t('reopenTicket')}
                </Button>
                <Button
                  disabled={support.submitting}
                  onClick={() => void transition('closed')}
                >
                  {t('closeTicket')}
                </Button>
              </div>
            ) : null}
          </DashboardPanel>
        </div>
      ) : null}
    </DashboardPage>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/45 rounded-xl p-3">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-navy mt-1 font-semibold">{value}</dd>
    </div>
  );
}

function formatDate(formatter: Intl.DateTimeFormat, value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '-' : formatter.format(parsed);
}
