'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
  DashboardPanel,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { ROUTES } from '@/routes';

export function ConfirmDeleteClient({ token }: { token: string }) {
  const t = useTranslations('dataRequestsWorkspace');
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const confirmDeletion = async () => {
    if (!token) return;
    setBusy(true);
    setError(false);
    try {
      await apiClient('/data-requests/confirm-delete', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      localStorage.removeItem('gamblock_access_token');
      localStorage.removeItem('gamblock_refresh_token');
      localStorage.removeItem('gamblock_user');
      document.cookie =
        'gamblock_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      router.replace(ROUTES.HOME);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={Trash2}
        eyebrow={t('eyebrow')}
        title={t('confirmPageTitle')}
        description={t('confirmPageDescription')}
      />
      <DashboardPanel
        icon={AlertTriangle}
        title={t('deleteDialogTitle')}
        accent="crimson"
      >
        <DashboardNotice
          icon={AlertTriangle}
          title={t('confirmWarning')}
          tone="crimson"
        >
          {token ? t('deleteScopeBody') : t('confirmTokenMissing')}
        </DashboardNotice>
        {error ? (
          <p className="text-crimson mt-4 text-sm font-semibold" role="alert">
            {t('deletionFailed')}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(ROUTES.DATA_REQUESTS)}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="destructive"
            disabled={!token || busy}
            onClick={() => void confirmDeletion()}
          >
            <Trash2 className="size-4" />
            {busy ? t('confirmingDelete') : t('confirmDelete')}
          </Button>
        </div>
      </DashboardPanel>
    </DashboardPage>
  );
}
