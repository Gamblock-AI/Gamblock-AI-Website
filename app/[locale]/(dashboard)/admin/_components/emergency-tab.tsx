import { useState } from 'react';
import { CheckCircle2, Clock3, KeyRound, Laptop, Loader2, User } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import type { EmergencyKeyRequest } from '@/hooks/use-admin-operations';
import { Pagination } from '@/components/dashboard/pagination';
import { usePagination } from '@/hooks/use-pagination';
import { toastError, toastSuccess } from '@/lib/feedback';
import { EmergencyKeyCard } from './emergency-key-card';
import { AdminStatusBadge } from './admin-shared';

interface EmergencyTabProps {
  requests: EmergencyKeyRequest[];
  emergencyKey: string | null;
  keyLoading: boolean;
  clearEmergencyKey: () => void;
  approveEmergencyKey: (requestId: string) => Promise<string>;
}

export function EmergencyTab({
  requests = [],
  emergencyKey,
  keyLoading,
  clearEmergencyKey,
  approveEmergencyKey,
}: EmergencyTabProps) {
  const t = useTranslations('adminPage');
  const tPagination = useTranslations('pagination');
  const locale = useLocale();
  const [keyCopied, setKeyCopied] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const safeRequests = requests ?? [];

  const {
    pagedItems: pagedRequests,
    page: requestsPage,
    totalPages: totalRequestsPages,
    setPage: setRequestsPage,
    startIndex: requestsStartIndex,
    endIndex: requestsEndIndex,
    totalItems: totalRequests,
  } = usePagination({ items: safeRequests, pageSize: 5 });

  const approve = async (requestId: string) => {
    setApprovingId(requestId);
    try {
      await approveEmergencyKey(requestId);
      setKeyCopied(false);
      toastSuccess(t('requestApproved'));
    } catch (error) {
      toastError(error, t('keyError'));
    } finally {
      setApprovingId(null);
    }
  };

  const copyKey = async () => {
    if (!emergencyKey) return;
    await navigator.clipboard.writeText(emergencyKey);
    setKeyCopied(true);
    window.setTimeout(() => setKeyCopied(false), 2400);
  };

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="space-y-5">
      {emergencyKey ? (
        <EmergencyKeyCard
          emergencyKey={emergencyKey}
          copied={keyCopied}
          onCopy={() => void copyKey()}
          onClose={clearEmergencyKey}
        />
      ) : null}

      {totalRequests > 0 ? (
        <section className="border-border bg-card shadow-soft overflow-hidden rounded-2xl border">
          {/* Panel Header */}
          <div className="border-border/80 border-b p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="bg-azure/80 text-navy ring-1 ring-navy/10 flex size-9 shrink-0 items-center justify-center rounded-xl shadow-2xs">
                <KeyRound className="size-4.5" aria-hidden="true" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-navy text-base font-bold">{t('emergencyTitle')}</h3>
                  <span className="text-[0.6875rem] font-bold text-navy/90 bg-azure/60 px-2.5 py-0.5 rounded-full border border-navy/15 shadow-2xs">
                    {totalRequests} permintaan
                  </span>
                </div>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {t('emergencyDescription')}
                </p>
              </div>
            </div>
          </div>

          {/* Request Rows */}
          <div className="divide-y divide-border/60">
            {pagedRequests.map((request) => (
              <EmergencyRequestRow
                key={request.id}
                request={request}
                dateFormatter={dateFormatter}
                isApproving={approvingId === request.id || keyLoading}
                onApprove={() => void approve(request.id)}
              />
            ))}
          </div>

          {/* Compact Aligned Footer */}
          <div className="border-border/80 bg-muted/15 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 border-t px-4 py-2.5 sm:px-5">
            <span className="text-muted-foreground text-xs font-semibold whitespace-nowrap self-start sm:self-center">
              {tPagination('showingRange', {
                start: requestsStartIndex,
                end: requestsEndIndex,
                total: totalRequests,
              })}
            </span>
            <Pagination
              currentPage={requestsPage}
              totalPages={totalRequestsPages}
              onPageChange={setRequestsPage}
              variant="flat"
              size="sm"
            />
          </div>
        </section>
      ) : !emergencyKey ? (
        <div className="border-border bg-card shadow-soft flex flex-col items-center justify-center gap-3.5 rounded-2xl border py-10 sm:py-14 px-6 text-center">
          <span className="bg-navy/5 text-navy flex size-12 items-center justify-center rounded-2xl ring-1 ring-navy/10">
            <KeyRound className="size-6" aria-hidden="true" />
          </span>
          <div className="space-y-1.5 max-w-md mx-auto text-center">
            <p className="text-navy text-sm font-bold text-center">
              {t('noEmergencyRequests')}
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed text-center">
              {t('noEmergencyRequestsBody')}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

interface EmergencyRequestRowProps {
  request: EmergencyKeyRequest;
  dateFormatter: Intl.DateTimeFormat;
  isApproving: boolean;
  onApprove: () => void;
}

function EmergencyRequestRow({
  request,
  dateFormatter,
  isApproving,
  onApprove,
}: EmergencyRequestRowProps) {
  const t = useTranslations('adminPage');

  return (
    <div className="p-3.5 sm:p-4 hover:bg-muted/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
      <div className="min-w-0 flex-1 space-y-2">
        {/* Top Header: Icon + ID + Status Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-amber/15 text-amber-700 dark:text-amber-300 ring-1 ring-amber/20 flex size-6 shrink-0 items-center justify-center rounded-md">
            <KeyRound className="size-3.5" aria-hidden="true" />
          </span>
          <span className="text-navy font-bold text-sm tracking-tight truncate">
            {t('requestLabel', { id: request.id })}
          </span>
          <AdminStatusBadge status={request.status} size="sm" />
        </div>

        {/* Metadata Chips: User, Device, Expiry */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <div className="inline-flex items-center gap-1.5 bg-muted/40 border border-border/50 px-2 py-0.5 rounded-md">
            <User className="size-3 text-navy/60 shrink-0" />
            <span className="font-semibold text-navy/80">Pemohon:</span>
            <span className="text-foreground font-medium">{request.requested_by}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-muted/40 border border-border/50 px-2 py-0.5 rounded-md font-mono text-[0.6875rem]">
            <Laptop className="size-3 text-navy/60 shrink-0" />
            <span className="font-sans font-semibold text-navy/80">Perangkat:</span>
            <span className="text-foreground">{request.device_id}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-amber/10 border border-amber/20 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-md text-[0.6875rem]">
            <Clock3 className="size-3 text-amber-600 shrink-0" />
            <span className="font-semibold">Batas:</span>
            <span>{dateFormatter.format(new Date(request.request_expires_at))}</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      {request.status === 'pending' || request.status === 'reviewed' ? (
        <div className="shrink-0 self-end sm:self-center">
          <Button
            size="sm"
            disabled={isApproving}
            onClick={onApprove}
            className="h-8 px-3.5 rounded-xl font-bold bg-navy text-white hover:bg-navy-light shadow-2xs transition-all active:scale-95"
          >
            {isApproving ? (
              <Loader2 className="size-3.5 mr-1.5 animate-spin" />
            ) : (
              <CheckCircle2 className="size-3.5 mr-1.5 text-azure" />
            )}
            {t('approveAndIssue')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
