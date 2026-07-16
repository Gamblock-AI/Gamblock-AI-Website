import { CircleAlert, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DashboardNotice } from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DeleteDataDialogProps {
  open: boolean;
  submitting: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => Promise<boolean>;
}

export function DeleteDataDialog({
  open,
  submitting,
  onOpenChange,
  onDelete,
}: DeleteDataDialogProps) {
  const t = useTranslations('dataRequestsWorkspace');

  const deleteData = async () => {
    if (await onDelete()) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <span className="bg-crimson/10 text-crimson mb-2 flex size-11 items-center justify-center rounded-xl">
            <Trash2 className="size-5" aria-hidden="true" />
          </span>
          <DialogTitle>{t('deleteDialogTitle')}</DialogTitle>
          <DialogDescription>{t('deleteDialogBody')}</DialogDescription>
        </DialogHeader>
        <DashboardNotice
          icon={CircleAlert}
          title={t('deleteScopeTitle')}
          tone="amber"
        >
          {t('deleteScopeBody')}
        </DashboardNotice>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            {t('cancel')}
          </DialogClose>
          <Button
            variant="destructive"
            disabled={submitting}
            onClick={() => void deleteData()}
          >
            {submitting ? t('submitting') : t('confirmDelete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
