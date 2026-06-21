'use client';

import { Clock } from 'lucide-react';
import { ApprovalRequest } from '@/hooks/use-accountability';
import { useTranslations } from "next-intl";

interface PendingRequestNotificationProps {
  pendingRequest: ApprovalRequest | undefined;
  onCancelRequest: (id: string) => void;
}

export function PendingRequestNotification({
  pendingRequest,
  onCancelRequest,
}: PendingRequestNotificationProps) {
    const t = useTranslations('PendingRequestNotification');
  if (!pendingRequest) return null;

  return (
    <div className="animate-fade-in flex flex-col items-start justify-between gap-3 rounded-lg border border-amber-100 bg-amber-50 p-5 text-amber-900 shadow-sm md:flex-row md:items-center">
      <div className="flex gap-3">
        <Clock className="mt-0.5 size-5.5 shrink-0 text-amber-600" />
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-amber-950">
            {t('text_64')}</h4>
          <p className="text-xs leading-relaxed font-semibold text-amber-800">
            {t('text_65')}{pendingRequest.id}{t('text_66')}{' '}
            <span className="font-bold italic">
              {t('text_67')}{pendingRequest.reason}{t('text_68')}</span>
            .
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onCancelRequest(pendingRequest.id)}
        className="flex shrink-0 cursor-pointer items-center gap-1 rounded-xl border border-amber-200 px-4 py-2.5 text-xs font-bold text-amber-900 transition-all hover:bg-amber-100/50"
      >
        {t('text_69')}</button>
    </div>
  );
}
