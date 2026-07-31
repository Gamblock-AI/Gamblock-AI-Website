'use client';

import { useState } from 'react';
import { PencilLine, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { NativeSelect } from '@/components/common/native-select';
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
import type {
  CreateIntentionInput,
  IntentionFocusPeriod,
  RecoveryIntention,
} from '@/lib/recovery/types';

interface IntentionEditorProps {
  intention?: RecoveryIntention | null;
  onSave: (value: CreateIntentionInput) => void;
}

export function IntentionEditor({
  intention,
  onSave,
}: IntentionEditorProps) {
  const t = useTranslations('recoveryDashboard');
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(intention?.title ?? '');
  const [nextAction, setNextAction] = useState(
    intention?.nextAction ?? ''
  );
  const [focusPeriod, setFocusPeriod] = useState<IntentionFocusPeriod>(
    intention?.focusPeriod ?? 'this_week'
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) return;
    setTitle(intention?.title ?? '');
    setNextAction(intention?.nextAction ?? '');
    setFocusPeriod(intention?.focusPeriod ?? 'this_week');
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedNextAction = nextAction.trim();
    if (!trimmedTitle || !trimmedNextAction) return;
    onSave({
      title: trimmedTitle,
      nextAction: trimmedNextAction,
      focusPeriod,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            className="h-11"
            aria-label={
              intention ? t('intentionEdit') : t('intentionCreate')
            }
          />
        }
      >
        {intention ? (
          <PencilLine className="size-4" aria-hidden="true" />
        ) : (
          <Plus className="size-4" aria-hidden="true" />
        )}
        {intention ? t('intentionEdit') : t('intentionCreate')}
      </DialogTrigger>

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
            <label
              htmlFor="recovery-intention"
              className="text-foreground text-sm font-semibold"
            >
              {t('intentionInputLabel')}
            </label>
            <Textarea
              id="recovery-intention"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t('intentionPlaceholder')}
              maxLength={240}
              rows={3}
              className="min-h-24 rounded-xl px-3 py-3 leading-6"
              autoFocus
              required
            />
            <p
              className="text-muted-foreground text-right text-xs"
              aria-live="polite"
            >
              {title.length}/240
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="recovery-next-action"
              className="text-foreground text-sm font-semibold"
            >
              {t('intentionNextActionLabel')}
            </label>
            <Textarea
              id="recovery-next-action"
              value={nextAction}
              onChange={(event) => setNextAction(event.target.value)}
              placeholder={t('intentionNextActionPlaceholder')}
              maxLength={160}
              rows={2}
              className="min-h-20 rounded-xl px-3 py-3 leading-6"
              required
            />
            <p
              className="text-muted-foreground text-right text-xs"
              aria-live="polite"
            >
              {nextAction.length}/160
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="recovery-focus-period"
              className="text-foreground text-sm font-semibold"
            >
              {t('intentionFocusPeriodLabel')}
            </label>
            <NativeSelect
              id="recovery-focus-period"
              value={focusPeriod}
              onChange={(event) =>
                setFocusPeriod(event.target.value as IntentionFocusPeriod)
              }
            >
              <option value="today">{t('focusToday')}</option>
              <option value="this_week">{t('focusThisWeek')}</option>
              <option value="two_weeks">{t('focusTwoWeeks')}</option>
              <option value="one_month">{t('focusOneMonth')}</option>
            </NativeSelect>
            <p className="text-muted-foreground text-xs leading-5">
              {t('intentionFocusPeriodHelp')}
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
            <Button
              type="submit"
              size="lg"
              className="h-11"
              disabled={!title.trim() || !nextAction.trim()}
            >
              {t('intentionSave')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
