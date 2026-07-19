import { Download, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DashboardPanel } from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';

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
    <div className={`grid gap-5 ${allowDelete ? 'md:grid-cols-2' : ''}`}>
      <DashboardPanel
        icon={Download}
        title={t('exportTitle')}
        description={t('exportBody')}
        className="flex h-full flex-col"
      >
        <Button
          size="lg"
          className="w-full sm:w-auto"
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
      </DashboardPanel>
      {allowDelete ? (
        <DashboardPanel
          icon={Trash2}
          title={t('deleteTitle')}
          description={t('deleteBody')}
          accent="crimson"
          className="flex h-full flex-col"
        >
          <Button
            variant="destructive"
            size="lg"
            className="w-full sm:w-auto"
            disabled={submitting !== null || activeDeletion}
            onClick={onDelete}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            {activeDeletion ? t('deleteActive') : t('deleteAction')}
          </Button>
        </DashboardPanel>
      ) : null}
    </div>
  );
}
