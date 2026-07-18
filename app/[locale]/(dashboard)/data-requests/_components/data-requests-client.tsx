'use client';

import { useState } from 'react';
import { CircleAlert, Database, LockKeyhole } from 'lucide-react';
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

export function DataRequestsClient() {
  const t = useTranslations('dataRequestsWorkspace');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { requests, loading, submitting, error, refetch, createRequest } =
    useDataRequests();

  const submitRequest = async (type: 'export' | 'delete'): Promise<boolean> => {
    try {
      await createRequest(type);
      toastSuccess(t(type === 'export' ? 'exportSuccess' : 'deleteSuccess'));
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
      />
      <DataRequestHistory
        requests={requests}
        loading={loading}
        error={error}
        onRetry={() => void refetch()}
      />
      <DeleteDataDialog
        open={deleteOpen}
        submitting={submitting !== null}
        onOpenChange={setDeleteOpen}
        onDelete={() => submitRequest('delete')}
      />
    </DashboardPage>
  );
}
