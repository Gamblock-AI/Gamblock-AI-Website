'use client';

import { useState } from 'react';
import { PencilLine, Target } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface IntentionEditorProps {
  value?: string;
  onSave: (value: string) => void;
}

export function IntentionEditor({ value, onSave }: IntentionEditorProps) {
  const t = useTranslations('recoveryDashboard');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value ?? '');

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) setDraft(value ?? '');
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <div className="flex items-start gap-3 border-t border-navy/15 bg-azure/20 px-4 py-4 sm:px-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy/8 text-navy">
          <Target className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-muted-foreground">
            {t('intentionLabel')}
          </p>
          {value ? (
            <p className="mt-1 text-sm leading-6 font-semibold text-navy sm:text-base">
              {value}
            </p>
          ) : (
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              {t('intentionEmpty')}
            </p>
          )}
        </div>
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              className="h-11 shrink-0 px-3 text-navy"
              aria-label={value ? t('intentionEdit') : t('intentionCreate')}
            />
          }
        >
          <PencilLine className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">
            {value ? t('intentionEdit') : t('intentionCreate')}
          </span>
        </DialogTrigger>
      </div>

      <DialogContent className="max-w-lg gap-5 rounded-2xl p-5 sm:max-w-lg sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-navy">
            {t('intentionDialogTitle')}
          </DialogTitle>
          <DialogDescription className="leading-6">
            {t('intentionDialogDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="recovery-intention" className="text-sm font-semibold text-foreground">
              {t('intentionInputLabel')}
            </label>
            <Textarea
              id="recovery-intention"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={t('intentionPlaceholder')}
              maxLength={280}
              rows={4}
              className="min-h-28 rounded-xl px-3 py-3 leading-6"
              autoFocus
            />
            <p className="text-right text-xs text-muted-foreground" aria-live="polite">
              {draft.length}/280
            </p>
          </div>

          <DialogFooter className="-mx-5 -mb-5 px-5 sm:-mx-6 sm:-mb-6 sm:px-6">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="h-11"
              onClick={() => setOpen(false)}
            >
              {t('intentionCancel')}
            </Button>
            <Button type="submit" size="lg" className="h-11" disabled={!draft.trim()}>
              {t('intentionSave')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
