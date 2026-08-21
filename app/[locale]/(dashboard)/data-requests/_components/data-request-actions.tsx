import {
  AlertTriangle,
  Clock,
  Download,
  FileArchive,
  LockKeyhole,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DashboardPanel } from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DataRequestActionsProps {
  submitting: 'export' | 'delete' | null;
  onExport: () => void;
  onDelete: () => void;
  allowDelete: boolean;
  activeExport: boolean;
  activeDeletion: boolean;
}

export function DataRequestActions({
  submitting,
  onExport,
  onDelete,
  allowDelete,
  activeExport,
  activeDeletion,
}: DataRequestActionsProps) {
  const t = useTranslations('dataRequestsWorkspace');

  return (
    <div className={cn('flex flex-col gap-4 h-full', allowDelete ? '' : '')}>
      <DashboardPanel
        icon={Download}
        title={t('exportTitle')}
        description={t('exportBody')}
        density="compact"
        className="flex h-full flex-col"
        contentClassName="flex flex-1 flex-col justify-between"
        action={
          <span className="rounded-md border border-navy/15 bg-azure/60 px-2 py-0.5 text-[0.6875rem] font-bold text-navy shadow-2xs">
            JSON / ZIP
          </span>
        }
      >
        <div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[0.6875rem]">
            <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 p-2">
              <ShieldCheck className="size-3.5 text-sage-dark shrink-0" aria-hidden="true" />
              <span className="font-semibold text-navy truncate">{t('protectionLogs')}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 p-2">
              <LockKeyhole className="size-3.5 text-navy shrink-0" aria-hidden="true" />
              <span className="font-semibold text-navy truncate">{t('encryptedEntries')}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 p-2">
              <FileArchive className="size-3.5 text-navy shrink-0" aria-hidden="true" />
              <span className="font-semibold text-navy truncate">{t('standardFormat')}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 p-2">
              <Clock className="size-3.5 text-amber-800 shrink-0" aria-hidden="true" />
              <span className="font-semibold text-navy truncate">{t('downloadWindow')}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-border/50 pt-3">
          <Button
            size="default"
            className="w-full font-bold rounded-xl bg-navy text-white hover:bg-navy-light shadow-2xs transition-all duration-200"
            disabled={submitting !== null || activeExport}
            onClick={onExport}
          >
            <Download className="size-4" aria-hidden="true" />
            {submitting === 'export'
              ? t('submitting')
              : activeExport
                ? t('exportActive')
                : t('exportAction')}
          </Button>
        </div>
      </DashboardPanel>

      {allowDelete ? (
        <DashboardPanel
          icon={Trash2}
          title={t('deleteTitle')}
          description={t('deleteBody')}
          accent="crimson"
          density="compact"
          className="flex h-full flex-col"
          contentClassName="flex flex-1 flex-col justify-between"
          action={
            <span className="rounded-md border border-crimson/25 bg-crimson/10 px-2 py-0.5 text-[0.6875rem] font-bold text-crimson-dark shadow-2xs">
              {t('permanentBadge')}
            </span>
          }
        >
          <div>
            <div className="mt-3 rounded-lg border border-crimson/20 bg-crimson/[0.04] p-2.5 flex items-start gap-2">
              <AlertTriangle className="size-3.5 text-crimson shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-[0.6875rem] text-crimson-dark leading-relaxed font-medium">
                {t('deleteWarning')}
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-border/50 pt-3">
            <Button
              variant="destructive"
              size="default"
              className="w-full font-bold rounded-xl shadow-2xs transition-all duration-200"
              disabled={submitting !== null || activeDeletion}
              onClick={onDelete}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              {activeDeletion ? t('deleteActive') : t('deleteAction')}
            </Button>
          </div>
        </DashboardPanel>
      ) : null}
    </div>
  );
}
