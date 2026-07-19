import { Download, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DashboardPanel } from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';

interface DataRequestActionsProps {
  submitting: 'export' | 'delete' | null;
  onExport: () => void;
  onDelete: () => void;
  allowDelete: boolean;
}

export function DataRequestActions({
  submitting,
  onExport,
  onDelete,
  allowDelete,
}: DataRequestActionsProps) {
  const t = useTranslations('dataRequestsWorkspace');

  return (
    <div className={`grid gap-5 ${allowDelete ? 'md:grid-cols-2' : ''}`}>
      {allowDelete ? (
        <DashboardPanel
          icon={Download}
          title={t('exportTitle')}
          description={t('exportBody')}
          className="flex h-full flex-col"
        >
          <Button
            size="lg"
            className="w-full sm:w-auto"
            disabled={submitting !== null}
            onClick={onExport}
          >
            <Download className="size-4" aria-hidden="true" />
            {submitting === 'export' ? t('submitting') : t('exportAction')}
          </Button>
        </DashboardPanel>
      ) : null}
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
          disabled={submitting !== null}
          onClick={onDelete}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          {t('deleteAction')}
        </Button>
      </DashboardPanel>
    </div>
  );
}
