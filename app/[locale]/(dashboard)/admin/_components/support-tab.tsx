'use client';

import { type FormEvent, useState } from 'react';
import { ArrowLeft, MessageSquare, UserCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type {
  AdminDataRequest,
  AdminSupportCase,
} from '@/hooks/use-admin-operations';
import { SupportStatusBadge } from '@/components/dashboard/support-status-badge';
import { toastError, toastSuccess } from '@/lib/feedback';
import {
  dynamicLabelFallback,
  dynamicLabelKey,
} from '@/lib/i18n/dynamic-labels';
import {
  AdminEmptyTable,
  AdminSectionHeader,
  AdminStatusBadge,
  AdminTableShell,
  adminFieldClassName,
} from './admin-shared';

interface SupportTabProps {
  userId?: string;
  cases: AdminSupportCase[];
  dataRequests: AdminDataRequest[];
  getSupportCase: (id: string) => Promise<AdminSupportCase>;
  claimSupportCase: (id: string, reason: string) => Promise<AdminSupportCase>;
  releaseSupportCase: (id: string, reason: string) => Promise<unknown>;
  replySupportCase: (id: string, content: string) => Promise<unknown>;
  transitionSupportCase: (id: string, status: string) => Promise<unknown>;
  retryDataRequest: (id: string) => Promise<unknown>;
  rejectDataRequest: (id: string, reason: string) => Promise<unknown>;
}

export function SupportTab(props: SupportTabProps) {
  const t = useTranslations('adminPage');
  const tDynamic = useTranslations('dynamicLabels');
  const [selected, setSelected] = useState<AdminSupportCase | null>(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);

  const openCase = async (item: AdminSupportCase) => {
    if (!item.owner) {
      const reason = window.prompt(t('claimReasonPrompt'));
      if (!reason) return;
      setBusy(true);
      try {
        await props.claimSupportCase(item.id, reason);
        setSelected(await props.getSupportCase(item.id));
        toastSuccess(t('caseClaimed'));
      } catch (error) {
        toastError(error, t('caseActionError'));
      } finally {
        setBusy(false);
      }
      return;
    }
    if (item.owner !== props.userId) {
      toastError(new Error('assigned'), t('caseOwnedByOther'));
      return;
    }
    setBusy(true);
    try {
      setSelected(await props.getSupportCase(item.id));
    } catch (error) {
      toastError(error, t('caseActionError'));
    } finally {
      setBusy(false);
    }
  };

  const reloadSelected = async () => {
    if (selected) setSelected(await props.getSupportCase(selected.id));
  };

  const sendReply = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected || !reply.trim()) return;
    setBusy(true);
    try {
      await props.replySupportCase(selected.id, reply);
      setReply('');
      await reloadSelected();
      toastSuccess(t('replySent'));
    } catch (error) {
      toastError(error, t('caseActionError'));
    } finally {
      setBusy(false);
    }
  };

  if (selected) {
    return (
      <div className="space-y-4">
        <div className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Button
              size="icon"
              variant="ghost"
              aria-label={t('backToQueue')}
              onClick={() => setSelected(null)}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-navy font-extrabold">{selected.title}</h2>
                <SupportStatusBadge status={selected.status} />
              </div>
              <p className="text-muted-foreground mt-1 font-mono text-xs">
                {selected.id}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {selected.status !== 'resolved' && selected.status !== 'closed' ? (
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await props.transitionSupportCase(selected.id, 'resolved');
                    await reloadSelected();
                    toastSuccess(t('caseResolved'));
                  } catch (error) {
                    toastError(error, t('caseActionError'));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {t('markResolved')}
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={async () => {
                const reason = window.prompt(t('releaseReasonPrompt'));
                if (!reason) return;
                setBusy(true);
                try {
                  await props.releaseSupportCase(selected.id, reason);
                  setSelected(null);
                  toastSuccess(t('caseReleased'));
                } catch (error) {
                  toastError(error, t('caseActionError'));
                } finally {
                  setBusy(false);
                }
              }}
            >
              {t('releaseCase')}
            </Button>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
          <Card className="p-5">
            <div className="space-y-3">
              {(selected.messages ?? []).map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[85%] rounded-2xl p-4 ${message.author_role === 'support_operator' ? 'bg-navy ml-auto text-white' : 'bg-muted text-navy'}`}
                >
                  <p className="text-[10px] font-bold tracking-wide uppercase opacity-70">
                    {message.author_role === 'support_operator'
                      ? t('supportTeam')
                      : t('requester')}
                  </p>
                  <p className="mt-1 text-sm leading-6 whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className="mt-2 text-[10px] opacity-60">
                    {new Date(message.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <form
              onSubmit={(event) => void sendReply(event)}
              className="border-border mt-5 flex flex-col gap-3 border-t pt-4"
            >
              <textarea
                className={`${adminFieldClassName} min-h-28 py-3`}
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder={t('replyPlaceholder')}
                maxLength={4000}
                required
              />
              <Button className="self-end" disabled={busy}>
                <MessageSquare className="size-4" />
                {t('sendReply')}
              </Button>
            </form>
          </Card>
          <Card className="h-fit p-5">
            <h3 className="text-navy font-bold">{t('caseContext')}</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground text-xs">{t('thType')}</dt>
                <dd className="text-navy mt-1 font-semibold">
                  {tDynamic(dynamicLabelKey('supportType', selected.type), {
                    value: dynamicLabelFallback(selected.type),
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">
                  {t('thPriority')}
                </dt>
                <dd className="text-navy mt-1 font-semibold">
                  {tDynamic(dynamicLabelKey('priority', selected.priority), {
                    value: dynamicLabelFallback(selected.priority),
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Impact</dt>
                <dd className="text-navy mt-1 font-semibold">
                  {selected.impact || '—'}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title={t('supportTitle')}
        description={t('supportDescription')}
      />
      <AdminTableShell>
        <Table className="[&_td]:px-4 [&_td]:py-3.5 sm:[&_td]:px-5 [&_th]:h-12 [&_th]:px-4 sm:[&_th]:px-5">
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>{t('thSubject')}</TableHead>
              <TableHead>{t('thPriority')}</TableHead>
              <TableHead>{t('thStatus')}</TableHead>
              <TableHead>{t('owner')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {props.cases.length === 0 ? (
              <AdminEmptyTable colSpan={6} text={t('noTickets')} />
            ) : (
              props.cases.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">{item.id}</TableCell>
                  <TableCell className="text-navy font-semibold">
                    {item.title}
                  </TableCell>
                  <TableCell>
                    {tDynamic(dynamicLabelKey('priority', item.priority), {
                      value: dynamicLabelFallback(item.priority),
                    })}
                  </TableCell>
                  <TableCell>
                    <SupportStatusBadge status={item.status} />
                  </TableCell>
                  <TableCell>
                    {item.owner
                      ? item.owner === props.userId
                        ? t('ownedByYou')
                        : t('ownedByOther')
                      : t('unassigned')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={item.owner ? 'outline' : 'primary'}
                      disabled={
                        busy ||
                        Boolean(item.owner && item.owner !== props.userId)
                      }
                      onClick={() => void openCase(item)}
                    >
                      <UserCheck className="size-4" />
                      {item.owner ? t('openCase') : t('claimCase')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminTableShell>

      <div className="space-y-3">
        <div>
          <h3 className="text-navy font-bold">{t('dataRequestsTitle')}</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('dataRequestsHelp')}
          </p>
        </div>
        <AdminTableShell>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>{t('thType')}</TableHead>
                <TableHead>{t('thStatus')}</TableHead>
                <TableHead>{t('retryCount')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.dataRequests.length === 0 ? (
                <AdminEmptyTable colSpan={5} text={t('noDataRequests')} />
              ) : (
                props.dataRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono text-xs">
                      {request.id}
                    </TableCell>
                    <TableCell>{request.title}</TableCell>
                    <TableCell>
                      <AdminStatusBadge status={request.status} />
                    </TableCell>
                    <TableCell>{request.retry_count}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {request.status === 'failed' &&
                        request.retry_count < 3 ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              void props
                                .retryDataRequest(request.id)
                                .then(() => toastSuccess(t('requestRetried')))
                                .catch((error) =>
                                  toastError(error, t('dataRequestActionError'))
                                )
                            }
                          >
                            {t('retry')}
                          </Button>
                        ) : null}
                        {['failed', 'queued'].includes(request.status) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const reason = window.prompt(t('reasonPrompt'));
                              if (reason)
                                void props
                                  .rejectDataRequest(request.id, reason)
                                  .then(() =>
                                    toastSuccess(t('requestRejected'))
                                  )
                                  .catch((error) =>
                                    toastError(
                                      error,
                                      t('dataRequestActionError')
                                    )
                                  );
                            }}
                          >
                            {t('reject')}
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </AdminTableShell>
      </div>
    </div>
  );
}
