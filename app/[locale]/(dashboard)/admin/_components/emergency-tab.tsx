import { useState } from 'react';
import { Clock3, UserRoundCheck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { EmergencyKeyRequest } from '@/hooks/use-admin-operations';
import { toastError, toastSuccess } from '@/lib/feedback';
import { EmergencyKeyCard } from './emergency-key-card';
import { AdminSectionHeader } from './admin-shared';

interface EmergencyTabProps {
  userId?: string;
  requests: EmergencyKeyRequest[];
  emergencyKey: string | null;
  keyLoading: boolean;
  clearEmergencyKey: () => void;
  reviewEmergencyKey: (requestId: string) => Promise<void>;
  approveEmergencyKey: (requestId: string) => Promise<string>;
}

export function EmergencyTab({
  userId,
  requests,
  emergencyKey,
  keyLoading,
  clearEmergencyKey,
  reviewEmergencyKey,
  approveEmergencyKey,
}: EmergencyTabProps) {
  const t = useTranslations('adminPage');
  const locale = useLocale();
  const [keyCopied, setKeyCopied] = useState(false);

  const approve = async (requestId: string) => {
    try {
      await approveEmergencyKey(requestId);
      setKeyCopied(false);
      toastSuccess(t('requestApproved'));
    } catch (error) {
      toastError(error, t('keyError'));
    }
  };

  const review = async (requestId: string) => {
    try {
      await reviewEmergencyKey(requestId);
      toastSuccess(t('requestReviewed'));
    } catch (error) {
      toastError(error, t('keyError'));
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
    <div className="space-y-4">
      <AdminSectionHeader
        title={t('emergencyTitle')}
        description={t('emergencyDescription')}
      />
      {emergencyKey ? (
        <EmergencyKeyCard
          emergencyKey={emergencyKey}
          copied={keyCopied}
          onCopy={() => void copyKey()}
          onClose={clearEmergencyKey}
        />
      ) : null}
      <div className="space-y-3">
        {requests.length === 0 ? (
          <Card className="text-muted-foreground p-6 text-center text-sm">
            {t('noEmergencyRequests')}
          </Card>
        ) : (
          requests.map((request) => (
            <EmergencyRequestCard
              key={request.id}
              request={request}
              dateFormatter={dateFormatter}
              keyLoading={keyLoading}
              currentUserId={userId}
              onReview={() => void review(request.id)}
              onApprove={() => void approve(request.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface EmergencyRequestCardProps {
  request: EmergencyKeyRequest;
  dateFormatter: Intl.DateTimeFormat;
  keyLoading: boolean;
  currentUserId?: string;
  onReview: () => void;
  onApprove: () => void;
}

function EmergencyRequestCard({
  request,
  dateFormatter,
  keyLoading,
  currentUserId,
  onReview,
  onApprove,
}: EmergencyRequestCardProps) {
  const t = useTranslations('adminPage');

  return (
    <Card className="flex flex-col gap-4 p-5 transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="bg-amber/10 text-amber flex size-9 shrink-0 items-center justify-center rounded-xl">
          <UserRoundCheck className="size-5" />
        </div>
        <div>
          <p className="text-navy font-semibold">
            {t('requestLabel', { id: request.id })}
          </p>
          <p className="text-muted-foreground mt-1 text-xs leading-5">
            {t('requestedBy', { user: request.requested_by })}
          </p>
          <p className="text-muted-foreground mt-1 font-mono text-xs">
            {t('deviceLabel', { device: request.device_id })}
          </p>
          <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
            <Clock3 className="size-3.5" />
            {t('approvalExpires', {
              time: dateFormatter.format(new Date(request.request_expires_at)),
            })}
          </p>
        </div>
      </div>
      {request.status === 'pending' ? (
        <Button disabled={keyLoading} onClick={onReview}>
          {t('reviewRequest')}
        </Button>
      ) : request.reviewed_by === currentUserId ? (
        <Badge variant="secondary">{t('needsOtherAdmin')}</Badge>
      ) : (
        <Button disabled={keyLoading} onClick={onApprove}>
          {t('approveAndIssue')}
        </Button>
      )}
    </Card>
  );
}
