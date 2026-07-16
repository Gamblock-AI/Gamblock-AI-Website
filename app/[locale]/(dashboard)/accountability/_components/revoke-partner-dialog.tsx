import { useTranslations } from 'next-intl';
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

interface RevokePartnerDialogProps {
  open: boolean;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onRevoke: () => Promise<void> | void;
}

export function RevokePartnerDialog({
  open,
  loading,
  onOpenChange,
  onRevoke,
}: RevokePartnerDialogProps) {
  const t = useTranslations('accountabilityWorkspace');

  const revoke = () => {
    void Promise.resolve(onRevoke()).then(() => onOpenChange(false));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('revokeDialogTitle')}</DialogTitle>
          <DialogDescription>{t('revokeDialogBody')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            {t('cancel')}
          </DialogClose>
          <Button variant="destructive" disabled={loading} onClick={revoke}>
            {loading ? t('revoking') : t('confirmRevoke')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
