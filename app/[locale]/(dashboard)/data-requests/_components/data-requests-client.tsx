'use client';

import { useState } from 'react';
import { CircleAlert, Database } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
} from '@/components/dashboard/dashboard-page';
import { useDataRequests } from '@/hooks/use-data-requests';
import { toastError, toastSuccess } from '@/lib/feedback';
import { DataRequestActions } from './data-request-actions';
import { DataRequestHistory } from './data-request-history';
import { DeleteDataDialog } from './delete-data-dialog';
import { useLocalUser } from '@/hooks/use-local-user';

export function DataRequestsClient() {
  const t = useTranslations('dataRequestsWorkspace');
  const user = useLocalUser();
  const canDelete = user.role === 'user' || user.role === 'partner';
  const [deleteOpen, setDeleteOpen] = useState(false);
  const {
    requests,
    loading,
    submitting,
    downloadingId,
    error,
    activeExport,
    activeDeletion,
    refetch,
    createRequest,
    downloadExport,
  } = useDataRequests();

  const submitRequest = async (type: 'export' | 'delete'): Promise<boolean> => {
    try {
      const request = await createRequest(type);
      toastSuccess(
        t(
          type === 'export' && request.status === 'completed'
            ? 'exportReady'
            : type === 'export'
              ? 'exportSuccess'
              : 'deleteSuccess'
        )
      );
      return true;
    } catch (requestError) {
      toastError(requestError, t('requestError'));
      return false;
    }
  };

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={Database}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />
      <DashboardNotice
        icon={CircleAlert}
        title={t('localDataTitle')}
        tone="navy"
      >
        {t('localDataBody')}
      </DashboardNotice>
      <DataRequestActions
        submitting={submitting}
        onExport={() => void submitRequest('export')}
        onDelete={() => setDeleteOpen(true)}
        allowDelete={canDelete}
        activeExport={activeExport}
        activeDeletion={activeDeletion}
      />
      <DataRequestHistory
        requests={requests}
        loading={loading}
        error={error}
        onRetry={() => void refetch()}
        onCreateExport={() => void submitRequest('export')}
        submittingExport={submitting === 'export'}
        downloadingId={downloadingId}
        activeExport={activeExport}
        onDownload={(id) =>
          void downloadExport(id).catch((downloadError) =>
            toastError(downloadError, t('downloadError'))
          )
        }
      />
      {canDelete ? (
        <DeleteDataDialog
          open={deleteOpen}
          submitting={submitting !== null}
          onOpenChange={setDeleteOpen}
          onDelete={() => submitRequest('delete')}
        />
      ) : null}
    </DashboardPage>
  );
}
