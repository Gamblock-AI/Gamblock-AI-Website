'use client';

import { useState } from 'react';
import { RefreshCw, SkipForward } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type {
  DailyMissionItem,
  MissionAdjustmentReason,
} from '@/hooks/use-daily-mission';
import type { MissionNumber } from '@/lib/recovery/types';
import { cn } from '@/lib/utils';

const reasons: MissionAdjustmentReason[] = [
  'not_enough_time',
  'not_a_good_fit',
  'need_lower_effort',
  'accessibility_need',
  'prefer_not_to_say',
];

const reasonKeys: Record<MissionAdjustmentReason, string> = {
  not_enough_time: 'adjustReasonNotEnoughTime',
  not_a_good_fit: 'adjustReasonNotAGoodFit',
  need_lower_effort: 'adjustReasonNeedLowerEffort',
  accessibility_need: 'adjustReasonAccessibilityNeed',
  prefer_not_to_say: 'adjustReasonPreferNotToSay',
};

interface MissionAdjustDialogProps {
  open: boolean;
  task: DailyMissionItem;
  replacementOptions: MissionNumber[];
  busy: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: {
    action: 'skip' | 'replace';
    reason: MissionAdjustmentReason;
    replacementNumber?: MissionNumber;
  }) => Promise<boolean>;
}

export function MissionAdjustDialog({
  open,
  task,
  replacementOptions,
  busy,
  onOpenChange,
  onSubmit,
}: MissionAdjustDialogProps) {
  const t = useTranslations('recoveryDashboard');
  const [action, setAction] = useState<'skip' | 'replace'>(
    replacementOptions.length > 0 ? 'replace' : 'skip'
  );
  const [reason, setReason] =
    useState<MissionAdjustmentReason>('not_enough_time');
  const [replacementNumber, setReplacementNumber] = useState<
    MissionNumber | undefined
  >(replacementOptions[0]);

  const submit = async () => {
    const saved = await onSubmit({
      action,
      reason,
      replacementNumber: action === 'replace' ? replacementNumber : undefined,
    });
    if (saved) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90dvh,38rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-navy text-lg font-bold">
            {t('adjustTitle')}
          </DialogTitle>
          <DialogDescription>{t('adjustDescription')}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2" role="group">
          {(['replace', 'skip'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setAction(option)}
              aria-pressed={action === option}
              className={cn(
                'focus-visible:ring-navy/30 flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold outline-none focus-visible:ring-2',
                action === option
                  ? 'border-navy bg-navy text-white'
                  : 'border-border bg-card text-navy hover:bg-muted'
              )}
            >
              {option === 'replace' ? (
                <RefreshCw className="size-4" aria-hidden="true" />
              ) : (
                <SkipForward className="size-4" aria-hidden="true" />
              )}
              {t(option === 'replace' ? 'adjustReplace' : 'adjustSkip')}
            </button>
          ))}
        </div>

        {action === 'replace' ? (
          <fieldset>
            <legend className="text-navy mb-2 text-sm font-bold">
              {t('adjustReplacement')}
            </legend>
            <div className="space-y-2">
              {replacementOptions.map((number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => setReplacementNumber(number)}
                  aria-pressed={replacementNumber === number}
                  className={cn(
                    'focus-visible:ring-navy/30 min-h-12 w-full rounded-xl border px-4 text-left text-sm font-semibold outline-none focus-visible:ring-2',
                    replacementNumber === number
                      ? 'border-navy bg-azure/60 text-navy'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  {t(`mission${number}`)}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        <label className="text-navy text-sm font-bold">
          {t('adjustReason')}
          <select
            value={reason}
            onChange={(event) =>
              setReason(event.target.value as MissionAdjustmentReason)
            }
            className="border-border bg-card text-foreground focus-visible:ring-navy/30 mt-2 min-h-12 w-full rounded-xl border px-3 font-normal outline-none focus-visible:ring-2"
          >
            {reasons.map((item) => (
              <option key={item} value={item}>
                {t(reasonKeys[item])}
              </option>
            ))}
          </select>
        </label>

        <p className="text-muted-foreground text-xs">
          {t(`mission${task.number}`)}
        </p>
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            {t('adjustCancel')}
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={() => void submit()}
            disabled={busy || (action === 'replace' && !replacementNumber)}
          >
            {t(
              action === 'replace'
                ? 'adjustConfirmReplace'
                : 'adjustConfirmSkip'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
