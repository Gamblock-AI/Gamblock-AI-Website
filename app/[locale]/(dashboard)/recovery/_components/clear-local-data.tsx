import { useState } from 'react';
import { Trash2 } from 'lucide-react';
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
  DialogTrigger,
} from '@/components/ui/dialog';

interface ClearLocalDataProps {
  cleared: boolean;
  onClear: () => void;
}

export function ClearLocalData({ cleared, onClear }: ClearLocalDataProps) {
  const t = useTranslations('recoveryHub');
  const recoveryT = useTranslations('recoveryDashboard');
  const [open, setOpen] = useState(false);

  const clear = () => {
    onClear();
    setOpen(false);
  };

  return (
    <section
      className="border-border bg-card shadow-soft rounded-3xl border p-5 sm:p-6"
      aria-labelledby="clear-local-title"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 id="clear-local-title" className="text-navy text-base font-bold">
            {t('deleteLocalTitle')}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            {t('deleteLocalBody')}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button
                variant="outline"
                className="border-crimson/25 text-crimson hover:bg-crimson/5 h-11 shrink-0"
              />
            }
          >
            <Trash2 className="size-4" aria-hidden="true" />
            {t('deleteLocalAction')}
          </DialogTrigger>
          <DialogContent
            className="max-w-md rounded-2xl p-5"
            showCloseButton={false}
          >
            <DialogHeader>
              <DialogTitle className="text-navy text-lg font-bold">
                {t('deleteLocalTitle')}
              </DialogTitle>
              <DialogDescription className="leading-6">
                {t('deleteLocalBody')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="-mx-5 mt-2 -mb-5 px-5">
              <DialogClose render={<Button variant="outline" size="lg" />}>
                {recoveryT('intentionCancel')}
              </DialogClose>
              <Button variant="destructive" size="lg" onClick={clear}>
                {t('deleteLocalConfirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <p
        className="text-sage mt-3 min-h-5 text-sm font-semibold"
        aria-live="polite"
      >
        {cleared ? recoveryT('localDataCleared') : null}
      </p>
    </section>
  );
}
